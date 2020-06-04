/*! *****************************************************************************
Copyright (c) 2020 Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

import colors from 'colors';
import debug from 'debug';
import dotenv from 'dotenv';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import jwt, { Algorithm, VerifyOptions } from 'jsonwebtoken';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { InvalidJwtToken, InvalidOption, NoJwtException, InvalidAlgorithm, InvalidAudience, InvalidIssuer } from './HttpException';
//import indexOf from './indexOf';
import { checkUrl, getKey } from './JwksHelper';

dotenv.config();

const logger = debug('jwtproxy')
const logDebug = debug('jwtproxy:debug')
const tokenPrefix = "Bearer "; // is 7 characters
let failedCode = 401;

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
  /** short circuit and if disabled just a simple no op middleware */
  const envDisabled: boolean = process.env.JWTP_DISABLE == null ? false : process.env.JWTP_DISABLE.toLowerCase() === 'true';
  const optDisabled = proxyOptions?.disable as boolean;
  if (optDisabled || envDisabled)
  {
    logger('jwt proxy disabled - no jwt verification will occure'); 
    return async (req:Request, res:Response, next:NextFunction): Promise<void> =>{
      next();
      return;
    }
  }

  /** normal middleware when enabled */
  return async function jwtVerifyMiddleware(request: Request, response: Response, next: NextFunction): Promise<void> {
    logger('verifying a jwt token with options %o' + proxyOptions);

    //this first block is a short circuit on ecluced paths.
    //need tests: 1) proxy and ENV are set, both with excluded - only options is used. warn on ENV settings ignored
    //First check if this path is excluded and bail if true
    if (proxyOptions) {
      if (proxyOptions.excluded) {
        if (fastIndexOf(proxyOptions.excluded, request.originalUrl)) {
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
        if (fastIndexOf(excludes, request.originalUrl)) {
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
          verifyOptions.audience = proxyOptions.audience.split(";");
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

        verifyOptions.algorithms = [process.env.JWTP_ALG as Algorithm];
        verifyOptions.issuer = (process.env.JWTP_ISS) ? process.env.JWTP_ISS : '';
        verifyOptions.audience = (process.env.JWTP_AUD) ? process.env.JWTP_AUD.split(";") : '';
      }

      if (!verifyOptions.algorithms?.includes(alg)) {
        logger('No matching alogorithm present - returning 401: %o', alg);
        failedCode = 403;
        throw new InvalidAlgorithm('No matching alogorithm present');
      }

      if (secretOrKey.length > 0) {
        jwt.verify(token, secretOrKey, verifyOptions, (err) => {
          if (err) {
            if (err.message.indexOf('audience') > 0){
              failedCode = 403;
              throw new InvalidAudience(err.message);
            }

            if (err.message.indexOf('issuer') > 0){
              failedCode = 403;
              throw new InvalidIssuer(err.message);
            }

            if (err.message.indexOf('algorithm') > 0){
              failedCode = 403;
              throw new InvalidAudience(err.message);
            }

            throw new InvalidJwtToken(err);
          }
        });
      }
      else {
        throw new InvalidOption("Empty secret or key");
      }
    
      //made it this far so onwards.
      next();
      return;

    }
    catch (error) {
      //we try to send a generic 401 as we do not want to reveal too much
      //if we give out too much information then attackers know more about
      //what changes with different attempts.
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
  disable?: boolean|undefined,
  secretOrKey?: string,
  audience?: string,
  issuer?: string,
  jwksUrl?: string,
  algorithms?: Algorithm[],
  excluded?: string[]
}

/**
 * Does an indexOf from a array/object against a target and optional key
 * @param {string[]} subject - the source array or object.
 * @param {string} target - the value to lookup.
 * @returns {boolean} the index value where found or -1 if not found
 */
function fastIndexOf(subject: string[], target: string): boolean {

  for (let i = 0; i < subject.length; i++) {
    if (target.toLowerCase()===subject[i].toLowerCase()){
      return true;
    }
  }
  return false;
}