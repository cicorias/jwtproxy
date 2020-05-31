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

  //TODO: figure out how this story ends...
  return publicKey as string;
}

export function checkUrl(url:string): boolean {
  const regex = /^https?:\/\//
  return regex.test(url);
}
