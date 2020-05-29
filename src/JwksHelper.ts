import { VerifyOptions } from "jsonwebtoken";
import { JwtProxyOptions } from "index";
import { Algorithm } from 'jsonwebtoken';
import jwks, { ClientOptions } from 'jwks-rsa';

// need "allowed algorithms"
//https://github.com/auth0/node-jwks-rsa/blob/26e2fa3bd670707cba3585dfa2238bf8fd81c175/examples/express-demo/server.js

// really need to just shim this: https://github.com/auth0/node-jwks-rsa/blob/26e2fa3bd670707cba3585dfa2238bf8fd81c175/examples/express-demo/server.js#L12

//we onlyh do RS256
//a secret is supplied via options OR not; if NOT, then jwksuri is needed (options / env)
//extra validation fields are supplied as 'key:string, value:string' 
//   xtra val comes object OR via env.   if in env, they must be formatted '{k:v,k:v}' --- essentially needs to be a valid flat json object with the curly braces.??
//   aud, iss, 
// kid comes from the key and needs to be "looked up"
