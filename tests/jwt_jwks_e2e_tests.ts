/* eslint-disable no-undef */
import { expect } from 'chai';
import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
// import assert from 'assert';
import 'mocha';
import request from 'supertest';
import jwtProxy, { JwtProxyOptions } from '../src/index';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { genericHandlers } from './handlers2';

const privateKey = fs.readFileSync(__dirname + '/private.pem', 'utf-8');
const publicKey = fs.readFileSync(__dirname + '/public.pem', 'utf-8');


describe('Using jwks url endpoint', () => {
  const app = express();
  const router = express.Router();
  const path = '/';
  

  describe('Use ENV aud, alg, iss validation using secret as string', () => {
    before( function() {
      if (!process.env.E2E) {
        this.skip();
      }
    })

    const token = jwt.sign({
      aud: 'nobody',
      iss: 'foobar'
    }, privateKey, {
      algorithm: 'RS256',
      keyid: 'foobar'
    });
    
    const options: JwtProxyOptions = {
      jwksUrl: 'http://localhost:5500/tests/private.json'
    }

    before( function() {
      app.use(jwtProxy(options));
      // mock express handlers
      app.use('/', genericHandlers(router, path));
    });

    it('GET / should return 200', async () => {
      const result = await request(app).get('/')
        .set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });
  });

});