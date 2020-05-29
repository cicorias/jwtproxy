import dotenv from 'dotenv';
import debug from 'debug';
import colors from 'colors';
import { NextFunction, Request, Response, RequestHandler } from 'express';
import jwt, { VerifyOptions, Algorithm } from 'jsonwebtoken';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NoJwtException, InvalidOption, InvalidJwtToken } from './HttpException';
import indexOf from './indexOf'


//TODO: use env variables IF options are not provided to the middlware.
dotenv.config();

const logger = debug('jwtproxy:info')
const logDebug = debug('jwtproxy:debug')
const tokenPrefix = "Bearer "; // is 7 characters
const failedCode = 401;

/**
 * this allows adding to the Express.Request object.
 */
declare global {
  namespace Express {
      export interface Request {
          jwtToken: any;
      }
  }
}

function jwtProxy(proxyOptions?: JwtProxyOptions): RequestHandler {
  return async function jwtVerifyMiddleware(request: Request, response: Response, next: NextFunction): Promise<void> {
    /** note that we provide the error to the next() function to allow 
     * default express or the defined error handler to handle the error. for express
     * you must override the handler or provide env variable NODE_ENV=production if you
     * desire to NOT have the stack trace emitted.
    */
    logger('verifying a jwt token with options %o' + proxyOptions);

    //First check if this path is excluded
    if (proxyOptions?.excluded) {
      const isExcluded = indexOf(proxyOptions.excluded, request.originalUrl)
      if (isExcluded){
        next();
        return;
      }
    }

    const authHeader = request.headers.authorization;

    try {
      if (authHeader === undefined || authHeader === null) {
        logger('authHeader is null or absent - returning 401: %o', authHeader);
        throw new NoJwtException();
      }

      if (!authHeader.startsWith(tokenPrefix)) {
        logger('%s prefix absent - returning 401: %o', tokenPrefix, authHeader);
        throw new NoJwtException();
      }

      //grab token from the header
      const token: string = (authHeader) ? authHeader.substring(tokenPrefix.length, authHeader.length) : '';

      //pre-flight decode to get the kid, alg.
      request.jwtToken = jwt.decode(token, {complete: true});;

      let alg:Algorithm = 'HS256';
      let kid: string | undefined;

      if (request.jwtToken && typeof request.jwtToken == 'object'
          && request.jwtToken['header']) {
        if (request.jwtToken['header']['alg']) {
          alg = request.jwtToken['header']['alg'];
        }

        if (request.jwtToken['header']['kid']) {
          kid = request.jwtToken['header']['kid'];
        }
      }

      logDebug(colors.red('preFlightToken %o'), alg);

      //setup options
      const verifyOptions: VerifyOptions = {};

      if (proxyOptions) {
        if (proxyOptions.algorithms) {
          verifyOptions.algorithms = proxyOptions.algorithms;
        }
        if (proxyOptions.audience){
          verifyOptions.audience = proxyOptions.audience;
        }
        if (proxyOptions.issuer){
          verifyOptions.issuer = proxyOptions.issuer;
        }

        if (!proxyOptions.algorithms?.includes(alg)) {
          logger('No matching alogorithm present - returning 401: %o', alg);
          throw new InvalidOption();
        }
      }

      const secretOrKey = (proxyOptions?.secretOrKey) ? proxyOptions.secretOrKey: '';
      
      jwt.verify(token, secretOrKey, verifyOptions, (err, decoded) => {
        if (err) {
          throw new InvalidJwtToken(err);
        }
      });

      next();
      return;

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

/** Options for THIS middlware */
export interface JwtProxyOptions {
  secretOrKey?: string,
  audience?: string,
  issuer?: string,
  jwksUrl?: string,
  algorithms?: Algorithm[],
  excluded?: string[]
}

// /** Options for the jwks-rsa library */
// export interface JwksOptions {
//   jwksUri?: string,
//   requestHeaders?: Record<string, undefined>,
//   requestAgentOptions?: Record<string, undefined>,
//   timeout?: number,
//   proxy?: string
// }

