import { RequestHandler } from 'express';
import { Algorithm } from 'jsonwebtoken';
declare function jwtProxy(options?: JwtProxyOptions): RequestHandler;
export default jwtProxy;
export declare type fff = string | {
    [key: string]: never;
};
/** Options for THIS middlware */
export interface JwtProxyOptions {
    secretOrKey?: string;
    audience?: string;
    jwksUrl?: string;
    algorithms: Algorithm[];
}
/** Options for jsonwebtoken library */
export interface JwtVerifyOptions {
    algorithms?: Algorithm[];
    audience?: string;
    subject?: string;
    clockTolerance?: number;
    maxAge?: number;
    nonce?: string;
}
/** Options for the jwks-rsa library */
export interface JwksOptions {
    jwksUri?: string;
    requestHeaders?: Record<string, undefined>;
    requestAgentOptions?: Record<string, undefined>;
    timeout?: number;
    proxy?: string;
}
