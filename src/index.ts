import dotenv from 'dotenv';
import debug from 'debug';

import { NextFunction, Request, Response, RequestHandler } from 'express';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HttpException, NoJwtException } from './HttpException';

dotenv.config();

const logger = debug('jwtproxy')

function jwtProxy(options:string) : RequestHandler {
  return async function jwtVerifyMiddleware(request: Request, response: Response, next: NextFunction) : Promise<void> {
    /** note that we provide the error to the next() function to allow 
     * default express or the defined error handler to handle the error. for express
     * you must override the handler or provide env variable NODE_ENV=production if you
     * desire to NOT have the stack trace emitted.
    */
    logger('verifying a jwt token...' + options);
    const authHeader = request.get('authorization');
  
    if (authHeader == null ) {
      response.statusCode = 401;
      next(new NoJwtException());
    }
    else {
      next();
    }
  }
}



export default jwtProxy;

/**
 * append to the Express Response object
 * new properties.
 */
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Express {
  interface JwtVerify {
    user:string,
    aud:string
  }

  export interface Response {
      jwtverify: JwtVerify
  }
}

