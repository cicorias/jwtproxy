"use strict";
/*! *****************************************************************************
Copyright (c) 2020 Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
const debug_1 = __importDefault(require("debug"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HttpException_1 = require("./HttpException");
//import indexOf from './indexOf';
const JwksHelper_1 = require("./JwksHelper");
dotenv_1.default.config();
const logger = debug_1.default('jwtproxy');
const logDebug = debug_1.default('jwtproxy:debug');
const tokenPrefix = "Bearer "; // is 7 characters
let failedCode = 401;
function jwtProxy(proxyOptions) {
    /** short circuit and if disabled just a simple no op middleware */
    const envDisabled = process.env.JWTP_DISABLE == null ? false : process.env.JWTP_DISABLE.toLowerCase() === 'true';
    const optDisabled = proxyOptions === null || proxyOptions === void 0 ? void 0 : proxyOptions.disable;
    if (optDisabled || envDisabled) {
        logger('jwt proxy disabled - no jwt verification will occure');
        return async (req, res, next) => {
            next();
            return;
        };
    }
    /** normal middleware when enabled */
    return async function jwtVerifyMiddleware(request, response, next) {
        var _a;
        logger('verifying a jwt token with options %o' + proxyOptions);
        //this first block is a short circuit on ecluced paths.
        //need tests: 1) proxy and ENV are set, both with excluded - only options is used. warn on ENV settings ignored
        //First check if this path is excluded and bail if true
        if (proxyOptions) {
            if (proxyOptions.excluded) {
                if (fastIndexOf(proxyOptions.excluded, request.originalUrl)) {
                    next();
                    return;
                }
            }
        }
        else { //options are not provided so 
            //grab from env if exists; split and loop on ',' separators
            const envExcludes = process.env.JWTP_EXCLUDE ? process.env.JWTP_EXCLUDE : undefined;
            if (envExcludes != undefined) {
                const excludes = envExcludes.split(',');
                if (fastIndexOf(excludes, request.originalUrl)) {
                    next();
                    return;
                }
            }
        }
        //grab the header if it is there.
        const authHeader = request.headers.authorization;
        try {
            if (authHeader === undefined || authHeader === null) {
                logger('authHeader is null or absent - returning 401: %o', authHeader);
                throw new HttpException_1.NoJwtException();
            }
            if (!authHeader.startsWith(tokenPrefix)) {
                logger('%s prefix absent - returning 401: %o', tokenPrefix, authHeader);
                throw new HttpException_1.NoJwtException();
            }
            //grab token from the header
            const token = (authHeader) ? authHeader.substring(tokenPrefix.length, authHeader.length) : '';
            //pre-flight decode to get the kid, alg.
            request.jwtToken = jsonwebtoken_1.default.decode(token, { complete: true });
            let alg = 'HS256';
            if (request.jwtToken && typeof request.jwtToken == 'object'
                && request.jwtToken['header']) {
                if (request.jwtToken['header']['alg']) {
                    alg = request.jwtToken['header']['alg'];
                }
            }
            logDebug(colors_1.default.red('preFlightToken %o'), alg);
            //setup options
            const verifyOptions = {};
            let secretOrKey = '';
            //while we checked this above, we have more complex checks here.
            if (proxyOptions) {
                if (proxyOptions.secretOrKey) {
                    secretOrKey = proxyOptions.secretOrKey;
                }
                if (proxyOptions.algorithms) {
                    verifyOptions.algorithms = proxyOptions.algorithms;
                }
                if (proxyOptions.audience) {
                    verifyOptions.audience = proxyOptions.audience.split(";");
                }
                if (proxyOptions.issuer) {
                    verifyOptions.issuer = proxyOptions.issuer;
                }
                if (proxyOptions.jwksUrl) {
                    if (JwksHelper_1.checkUrl(proxyOptions.jwksUrl)) {
                        secretOrKey = await JwksHelper_1.getKey(request.jwtToken, proxyOptions === null || proxyOptions === void 0 ? void 0 : proxyOptions.jwksUrl);
                    }
                }
            }
            else {
                if (process.env.JWTP_URL) {
                    if (JwksHelper_1.checkUrl(process.env.JWTP_URl)) {
                        secretOrKey = await JwksHelper_1.getKey(request.jwtToken, process.env.JWTP_URL);
                    }
                    else {
                        secretOrKey = (process.env.JWTP_URL) ? process.env.JWTP_URL : '';
                    }
                }
                verifyOptions.algorithms = [process.env.JWTP_ALG];
                verifyOptions.issuer = (process.env.JWTP_ISS) ? process.env.JWTP_ISS : '';
                verifyOptions.audience = (process.env.JWTP_AUD) ? process.env.JWTP_AUD.split(";") : '';
            }
            if (!((_a = verifyOptions.algorithms) === null || _a === void 0 ? void 0 : _a.includes(alg))) {
                logger('No matching alogorithm present - returning 401: %o', alg);
                failedCode = 403;
                throw new HttpException_1.InvalidAlgorithm('No matching alogorithm present');
            }
            if (secretOrKey.length > 0) {
                jsonwebtoken_1.default.verify(token, secretOrKey, verifyOptions, (err) => {
                    if (err) {
                        if (err.message.indexOf('audience') > 0) {
                            failedCode = 403;
                            throw new HttpException_1.InvalidAudience(err.message);
                        }
                        if (err.message.indexOf('issuer') > 0) {
                            failedCode = 403;
                            throw new HttpException_1.InvalidIssuer(err.message);
                        }
                        if (err.message.indexOf('algorithm') > 0) {
                            failedCode = 403;
                            throw new HttpException_1.InvalidAudience(err.message);
                        }
                        throw new HttpException_1.InvalidJwtToken(err);
                    }
                });
            }
            else {
                throw new HttpException_1.InvalidOption("Empty secret or key");
            }
            //made it this far so onwards.
            next();
            return;
        }
        catch (error) {
            //we try to send a generic 401 as we do not want to reveal too much
            //if we give out too much information then attackers know more about
            //what changes with different attempts.
            logger(colors_1.default.red('failed jwt validation %o'), error.message);
            response.set({
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Expires': '-1',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1',
            }).status(failedCode).send();
        }
    };
}
exports.default = jwtProxy;
/**
 * Does an indexOf from a array/object against a target and optional key
 * @param {string[]} subject - the source array or object.
 * @param {string} target - the value to lookup.
 * @returns {boolean} the index value where found or -1 if not found
 */
function fastIndexOf(subject, target) {
    for (let i = 0; i < subject.length; i++) {
        if (target.toLowerCase() === subject[i].toLowerCase()) {
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=index.js.map