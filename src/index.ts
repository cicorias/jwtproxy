import dotenv from 'dotenv';
import debug from 'debug';
import colors from 'colors';
import { NextFunction, Request, Response, RequestHandler } from 'express';
import jwt, { VerifyOptions, Algorithm } from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpException, NoJwtException } from './HttpException';
import { getVerifyOptions } from './JwksHelper';

dotenv.config();

const logger = debug('jwtproxy:info')
const logDebug = debug('jwtproxy:debug')
const tokenPrefix = "Bearer "; // is 7 characters
const failedCode = 401;

function jwtProxy(options?: JwtProxyOptions): RequestHandler {
  return async function jwtVerifyMiddleware(request: Request, response: Response, next: NextFunction): Promise<void> {
    /** note that we provide the error to the next() function to allow 
     * default express or the defined error handler to handle the error. for express
     * you must override the handler or provide env variable NODE_ENV=production if you
     * desire to NOT have the stack trace emitted.
    */
    logger('verifying a jwt token with options %o' + options);
    const authHeader = request.headers.authorization;//.authorization.get('Authorization');
    try {
      if (authHeader === undefined || authHeader === null) {
        logger('authHeader is null/absent - returning 401: %o', authHeader);
        //response.statusCode = failedCode;
        //TODO: can we pass this to next() but suppress annoying mocha output of the 
        //TODO: entire stack trace.
        throw new NoJwtException();
      }

      if (!authHeader.startsWith(tokenPrefix)) {
        logger('%s prefix absent - returning 401: %o', tokenPrefix, authHeader);
        //response.statusCode = failedCode;
        throw new NoJwtException();
      }

      //grap token from the header
      const token: string = (authHeader) ? authHeader.substring(tokenPrefix.length, authHeader.length) : '';

      //pre-flight decode to get the kid, alg.
      const preFlightToken = jwt.decode(token, {complete: true});

      let alg:Algorithm = 'HS256';

      if (preFlightToken && typeof preFlightToken == 'object' && preFlightToken['header'] && preFlightToken['header']['alg']) {
        alg = preFlightToken['header']['alg'];
      }

      logDebug(colors.red('preFlightToken %o'), alg);


      //TODO: need a factory...
      //const verifyOption = await getVerifyOptions(options);

      //const decodedToken = jwt.verify(token, 'sharedsecret', verifyOption); 
      next();

    }
    catch (error) {
      logger(colors.red('failed jwt validation %o'), error.message);
      response.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Expires': '-1',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1',
      }).status(failedCode).send();
    }
  }
}

export default jwtProxy;

export type fff = string | { [key: string]:never}


/** Options for THIS middlware */
export interface JwtProxyOptions {
  secretOrKey?: string,
  audience?: string,
  jwksUrl?: string,
  algorithms: Algorithm[]
}


/** Options for jsonwebtoken library */
export interface JwtVerifyOptions {
  algorithms?: Algorithm[], //'RS256', //default HS256
  audience?: string,
  subject?: string,
  clockTolerance?: number,
  maxAge?: number,
  nonce?: string
}

/** Options for the jwks-rsa library */
export interface JwksOptions {
  jwksUri?: string,
  requestHeaders?: Record<string, undefined>,
  requestAgentOptions?: Record<string, undefined>,
  timeout?: number,
  proxy?: string
}


// import { IncomingHttpHeaders } from 'http';
// /** this allows adding custom headers 
//  * Request.Headers comes from root http objedct
// */
// declare module 'http' {
//     interface IncomingHttpHeaders {
//         Authorization?: string
//     }
// }

/**
 * append to the Express Response object
 * new properties.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Express {
  interface JwtVerify {
    user: string,
    aud: string
  }
  export interface Response {
    jwtverify: JwtVerify
  }
}

