"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
// need "allowed algorithms"
//https://github.com/auth0/node-jwks-rsa/blob/26e2fa3bd670707cba3585dfa2238bf8fd81c175/examples/express-demo/server.js
// really need to just shim this: https://github.com/auth0/node-jwks-rsa/blob/26e2fa3bd670707cba3585dfa2238bf8fd81c175/examples/express-demo/server.js#L12
//we onlyh do RS256
//a secret is supplied via options OR not; if NOT, then jwksuri is needed (options / env)
//extra validation fields are supplied as 'key:string, value:string' 
//   xtra val comes object OR via env.   if in env, they must be formatted '{k:v,k:v}' --- essentially needs to be a valid flat json object with the curly braces.??
//   aud, iss, 
// kid comes from the key and needs to be "looked up"
async function getVerifyOptions(token, options) {
    //if options specifies JwksUri - that means we need to retrieve it.
    const rv = {};
    let alg = 'RS256';
    if (token && typeof token == 'object' && token['header'] && token['header']['alg']) {
        alg = token['header']['alg'];
    }
    if (options && options.audience)
        rv.audience = options.audience;
    if (options && options.jwksUrl) {
        const clientOptions = {
            jwksUri: options.jwksUrl
        };
        const client = new jwks_rsa_1.default.JwksClient(clientOptions);
        //const key = await client
    }
    //const a = options?.algorithms ? options.algorithms[0] : Algorithm;
    //if (options)
    rv.algorithms = [alg]; //'RS256', ...options.algorithms];
    return rv;
}
exports.getVerifyOptions = getVerifyOptions;
//# sourceMappingURL=JwksHelper.js.map