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
exports.checkUrl = exports.getKey = void 0;
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const HttpException_1 = require("./HttpException");
const util_1 = __importDefault(require("util"));
const debug_1 = __importDefault(require("debug"));
const logger = debug_1.default('jwtproxy');
const logDebug = debug_1.default('jwtproxy:debug');
async function getKey(jwtToken, jwksUrl) {
    if (!checkUrl(jwksUrl)) {
        throw new HttpException_1.InvalidJwksUrl(jwksUrl);
    }
    const clientOptions = {
        cache: true,
        jwksUri: jwksUrl
    };
    let kid = '';
    if (jwtToken && typeof jwtToken == 'object'
        && jwtToken['header']) {
        if (jwtToken['header']['kid']) {
            kid = jwtToken['header']['kid'];
        }
    }
    const client = jwks_rsa_1.default(clientOptions);
    const getSigningKeyAsync = util_1.default.promisify(client.getSigningKey);
    const publicKey = await getSigningKeyAsync(kid).then((result) => {
        logDebug(result);
        return result.getPublicKey();
    }).catch((err) => {
        logger(err);
    });
    return publicKey;
}
exports.getKey = getKey;
function checkUrl(url) {
    const regex = /^https?:\/\//;
    return regex.test(url);
}
exports.checkUrl = checkUrl;
//# sourceMappingURL=JwksHelper.js.map