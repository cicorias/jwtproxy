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

import jwks, { ClientOptions } from 'jwks-rsa';
import { InvalidJwksUrl } from './HttpException';
import util from 'util';

import debug from 'debug';
const logger = debug('jwtproxy')
const logDebug = debug('jwtproxy:debug')

export async function getKey(jwtToken: string, jwksUrl: string): Promise<string> {

  if (!checkUrl(jwksUrl)) {
    throw new InvalidJwksUrl(jwksUrl);
  }

  const clientOptions: ClientOptions = {
    cache: true,
    jwksUri: jwksUrl
  }

  let kid = '';
  if (jwtToken && typeof jwtToken == 'object'
    && jwtToken['header']) {
    if (jwtToken['header']['kid']) {
      kid = jwtToken['header']['kid'];
    }
  }

  const client = jwks(clientOptions);
  const getSigningKeyAsync = util.promisify(client.getSigningKey);

  const publicKey = await getSigningKeyAsync(kid).then((result) => {
    logDebug(result);
    return result.getPublicKey();
  }).catch((err) => {
    logger(err);
  })
  
  return publicKey as string;
}

export function checkUrl(url:string): boolean {
  const regex = /^https?:\/\//
  return regex.test(url);
}
