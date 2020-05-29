"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const debug_1 = __importDefault(require("debug"));
const colors_1 = __importDefault(require("colors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HttpException_1 = require("./HttpException");
const indexOf_1 = __importDefault(require("./indexOf"));
//TODO: use env variables IF options are not provided to the middlware.
dotenv_1.default.config();
const logger = debug_1.default('jwtproxy:info');
const logDebug = debug_1.default('jwtproxy:debug');
const tokenPrefix = "Bearer "; // is 7 characters
const failedCode = 401;
function jwtProxy(proxyOptions) {
    return async function jwtVerifyMiddleware(request, response, next) {
        var _a;
        /** note that we provide the error to the next() function to allow
         * default express or the defined error handler to handle the error. for express
         * you must override the handler or provide env variable NODE_ENV=production if you
         * desire to NOT have the stack trace emitted.
        */
        logger('verifying a jwt token with options %o' + proxyOptions);
        //First check if this path is excluded
        if (proxyOptions === null || proxyOptions === void 0 ? void 0 : proxyOptions.excluded) {
            const isExcluded = indexOf_1.default(proxyOptions.excluded, request.originalUrl);
            if (isExcluded) {
                next();
                return;
            }
        }
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
            ;
            let alg = 'HS256';
            let kid;
            if (request.jwtToken && typeof request.jwtToken == 'object'
                && request.jwtToken['header']) {
                if (request.jwtToken['header']['alg']) {
                    alg = request.jwtToken['header']['alg'];
                }
                if (request.jwtToken['header']['kid']) {
                    kid = request.jwtToken['header']['kid'];
                }
            }
            logDebug(colors_1.default.red('preFlightToken %o'), alg);
            //setup options
            const verifyOptions = {};
            if (proxyOptions) {
                if (proxyOptions.algorithms) {
                    verifyOptions.algorithms = proxyOptions.algorithms;
                }
                if (proxyOptions.audience) {
                    verifyOptions.audience = proxyOptions.audience;
                }
                if (proxyOptions.issuer) {
                    verifyOptions.issuer = proxyOptions.issuer;
                }
                if (!((_a = proxyOptions.algorithms) === null || _a === void 0 ? void 0 : _a.includes(alg))) {
                    logger('No matching alogorithm present - returning 401: %o', alg);
                    throw new HttpException_1.InvalidOption();
                }
            }
            const secretOrKey = (proxyOptions === null || proxyOptions === void 0 ? void 0 : proxyOptions.secretOrKey) ? proxyOptions.secretOrKey : '';
            jsonwebtoken_1.default.verify(token, secretOrKey, verifyOptions, (err, decoded) => {
                if (err) {
                    throw new HttpException_1.InvalidJwtToken(err);
                }
            });
            next();
            return;
        }
        catch (error) {
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
// /** Options for the jwks-rsa library */
// export interface JwksOptions {
//   jwksUri?: string,
//   requestHeaders?: Record<string, undefined>,
//   requestAgentOptions?: Record<string, undefined>,
//   timeout?: number,
//   proxy?: string
// }
//# sourceMappingURL=index.js.map