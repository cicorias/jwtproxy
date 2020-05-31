"use strict";
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
    //TODO: figure out how this story ends...
    return publicKey;
}
exports.getKey = getKey;
function checkUrl(url) {
    const regex = /^https?:\/\//;
    return regex.test(url);
}
exports.checkUrl = checkUrl;
//# sourceMappingURL=JwksHelper.js.map