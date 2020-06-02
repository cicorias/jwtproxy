import colors from 'colors';
import debug from 'debug';
import dotenv from 'dotenv';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt, { Algorithm, VerifyOptions } from 'jsonwebtoken';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { InvalidJwtToken, InvalidOption, NoJwtException } from './HttpException';
import indexOf from './indexOf';
import { checkUrl, getKey } from './JwksHelper';

dotenv.config();

const logger = debug('jwtproxy')
const logDebug = debug('jwtproxy:debug')
const tokenPrefix = "Bearer "; // is 7 characters
const failedCode = 401;

/**
 * this allows adding to the Express.Request object.
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface Request {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jwtToken: any;
    }
  }
}

function jwtProxy(proxyOptions?: JwtProxyOptions): RequestHandler {
  return async function jwtVerifyMiddleware(request: Request, response: Response, next: NextFunction): Promise<void> {
    logger('verifying a jwt token with options %o' + proxyOptions);

    //this first block is a short circuit on ecluced paths.
    //need tests: 1) proxy and ENV are set, both with excluded - only options is used. warn on ENV settings ignored
    //First check if this path is excluded and bail if true
    if (proxyOptions) {
      if (proxyOptions.excluded) {
        if (indexOf(proxyOptions.excluded, request.originalUrl)) {
          next();
          return;
        }
      }
    }
    else { //options are not provided so 
      //grab from env if exists; split and loop on ',' separators
      const envExcludes = process.env.JWTP_EXCLUDE ? process.env.JWTP_EXCLUDE : undefined;
      if (envExcludes != undefined) {
        const excludes = envExcludes.split(',');
        if (indexOf(excludes, request.originalUrl)) {
          next();
          return;
        }
      }
    }


    //grab the header if it is there.
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
      request.jwtToken = jwt.decode(token, { complete: true });

      let alg: Algorithm = 'HS256';

      if (request.jwtToken && typeof request.jwtToken == 'object'
        && request.jwtToken['header']) {
        if (request.jwtToken['header']['alg']) {
          alg = request.jwtToken['header']['alg'];
        }
      }

      logDebug(colors.red('preFlightToken %o'), alg);

      //setup options
      const verifyOptions: VerifyOptions = {};

      let secretOrKey = '';

      //while we checked this above, we have more complex checks here.
      if (proxyOptions) {

        if (proxyOptions.secretOrKey) {
          secretOrKey = proxyOptions.secretOrKey;
        }
        if (proxyOptions.algorithms) {
          verifyOptions.algorithms = proxyOptions.algorithms;
        }
        if (proxyOptions.audience) {
          verifyOptions.audience = proxyOptions.audience;
        }
        if (proxyOptions.issuer) {
          verifyOptions.issuer = proxyOptions.issuer;
        }
        if (proxyOptions.jwksUrl) {
          if (checkUrl(proxyOptions.jwksUrl)) {
            secretOrKey = await getKey(request.jwtToken, proxyOptions?.jwksUrl as string);
          }
        }

      }
      else {
        if (process.env.JWTP_URL) {
          if (checkUrl(process.env.JWTP_URl as string)) {
            secretOrKey = await getKey(request.jwtToken, process.env.JWTP_URL as string);
          }
          else {
            secretOrKey = (process.env.JWTP_URL) ? process.env.JWTP_URL : '';
          }
        }
        //TODO: deal with multiple algorithms supplied.
        verifyOptions.algorithms = [process.env.JWTP_ALG as Algorithm];
        verifyOptions.issuer = (process.env.JWTP_ISS) ? process.env.JWTP_ISS : '';
        verifyOptions.audience = (process.env.JWTP_AUD) ? process.env.JWTP_AUD : '';
      }

      if (!verifyOptions.algorithms?.includes(alg)) {
        logger('No matching alogorithm present - returning 401: %o', alg);
        throw new InvalidOption('No matching alogorithm present');
      }

      if (secretOrKey.length > 0) {
        jwt.verify(token, secretOrKey, verifyOptions, (err) => {
          if (err) {
            throw new InvalidJwtToken(err);
          }
        });
      }
      else {
        throw new InvalidJwtToken(Error("Empty secret or key"));
      }
    
      //made it this far so onwards.
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

