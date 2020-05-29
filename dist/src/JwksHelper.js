"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKey = void 0;
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const util_1 = __importDefault(require("util"));
// need "allowed algorithms"
//https://github.com/auth0/node-jwks-rsa/blob/26e2fa3bd670707cba3585dfa2238bf8fd81c175/examples/express-demo/server.js
// really need to just shim this: https://github.com/auth0/node-jwks-rsa/blob/26e2fa3bd670707cba3585dfa2238bf8fd81c175/examples/express-demo/server.js#L12
//we onlyh do RS256
//a secret is supplied via options OR not; if NOT, then jwksuri is needed (options / env)
//extra validation fields are supplied as 'key:string, value:string' 
//   xtra val comes object OR via env.   if in env, they must be formatted '{k:v,k:v}' --- essentially needs to be a valid flat json object with the curly braces.??
//   aud, iss, 
// kid comes from the key and needs to be "looked up"
async function getKey(jwtToken, jwksUrl) {
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
    const z = util_1.default.promisify(client.getSigningKey);
    const rv = await z(kid);
    return '';
}
exports.getKey = getKey;
// const jwksClient = require('jwks-rsa');
// const client = jwksClient({
//   strictSsl: true, // Default value
//   jwksUri: 'https://sandrino.auth0.com/.well-known/jwks.json',
//   requestHeaders: {}, // Optional
//   requestAgentOptions: {}, // Optional
//   timeout: ms('30s'), // Defaults to 30s
//   proxy: '[protocol]://[username]:[pass]@[address]:[port]', // Optional
// });
// const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
// client.getSigningKey(kid, (err, key) => {
//   const signingKey = key.getPublicKey();
// Now I can use this to configure my Express or Hapi middleware
//# sourceMappingURL=JwksHelper.js.map