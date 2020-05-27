import dotenv from 'dotenv';
import debug from 'debug';
import colors from 'colors';
import { NextFunction, Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpException, NoJwtException } from './HttpException';

dotenv.config();

const logger = debug('jwtproxy:info')
const logDebug = debug('jwtproxy:debug')
const tokenPrefix = "Bearer "; // is 7 characters
const failedCode = 401;

function jwtProxy(options?: jwtProxyOptions): RequestHandler {
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

      if (!authHeader?.startsWith(tokenPrefix)) {
        logger('%s prefix absent - returning 401: %o', tokenPrefix, authHeader);
        //response.statusCode = failedCode;
        throw new NoJwtException();
      }

      const token: string = (authHeader) ? authHeader.substring(tokenPrefix.length, authHeader.length) : '';
      logger('got token: %s', token);


      const decodedToken = jwt.verify(token, '');


      next();

    }
    catch (error) {
      logDebug(colors.red('failed jwt validation %o'), error.message);
      response.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Expires': '-1',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1',
      }).status(failedCode).send();
      // response.sendStatus(401);
    }


  }
}

export default jwtProxy;

export interface jwtProxyOptions {
  secretOrKey?: string,
  aud?: string,
  jwksUrl?: string
}

export interface jwksOptions {
  jwksUri?: string,
  requestHeaders?: object,
  requestAgentOptions?: object,
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

