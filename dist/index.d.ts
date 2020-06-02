import { RequestHandler } from 'express';
import { Algorithm } from 'jsonwebtoken';
/**
 * this allows adding to the Express.Request object.
 */
declare global {
    namespace Express {
        interface Request {
            jwtToken: any;
        }
    }
}
declare function jwtProxy(proxyOptions?: JwtProxyOptions): RequestHandler;
export default jwtProxy;
/** Options for THIS middlware */
export interface JwtProxyOptions {
    disable?: boolean | undefined;
    secretOrKey?: string;
    audience?: string;
    issuer?: string;
    jwksUrl?: string;
    algorithms?: Algorithm[];
    excluded?: string[];
}
