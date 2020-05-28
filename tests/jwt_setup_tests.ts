import { expect } from 'chai';
// import assert from 'assert';
import 'mocha';

import fs from 'fs';
import util from 'util';

const readFile = util.promisify(fs.readFile);

describe('Check if PEM and Jwks files are present',() => {
  it('file private.jwk exists', async () => {
    const rv = await readFile('./tests/private.json')
      .then(() => {
        return 'OK';
      })
      .catch(() => {
        return 'need to run generateJwksTestFiles.sh ...a'
      });
    
    console.error('what i got', rv);
    expect(rv).equal('OK');
  });

  it('file private.pem exists', async () => {
    const rv = await readFile('./tests/private.pem')
      .then(() => {
        return 'OK';
      })
      .catch(() => {
        return 'need to run generateJwksTestFiles.sh ...a'
      });
    
    expect(rv).equal('OK');
  });
  
});