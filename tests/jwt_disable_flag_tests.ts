/* eslint-disable no-undef */
import { expect } from 'chai';
import express from 'express';
import jwt from 'jsonwebtoken';
import 'mocha';
import request from 'supertest';
import jwtProxy, { JwtProxyOptions } from '../src/index';
import { genericHandlers } from './handlers2';
import { after } from 'mocha';


describe.skip('Disable flag tests.', () => {
  //weird it exist needs to be heare.
  //in mocha this has to be here to actually be set, but 
  //without mocking env it statys.
  process.env.JWTP_DISABLE = "true";
  const app = express();
  const router = express.Router();
  const path = '/';
  const secret = 'notasectet'


  process.env.JWTP_DISABLE = "true";
  after(()=>{
    delete process.env.JWTP_DISABLE;
  })

  /** disable with env. */
  describe('Use ENV and JWTP_DISABLE is set', () => {

    before(function () {
      app.use(jwtProxy());
      // mock express handlers
      app.use('/', genericHandlers(router, path));
      process.env.JWTP_ALG = 'HS256';
    });

    after(function() {
      delete process.env.JWTP_ALG;
      delete process.env.JWTP_URL;
    })

    it('"true" GET / should return 200', async () => {
      const result = await request(app).get('/')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });

  });

  describe.skip('Use ENV and JWTP_DISABLE is NOT set', () => {
    const token = jwt.sign({
    }, secret, { algorithm: 'HS256' });

    //weird it exist needs to be heare.
    //in mocha this has to be here to actually be set, but 
    //without mocking env it statys.
    delete process.env.JWTP_DISABLE;

    before(function () {
      app.use(jwtProxy());
      // mock express handlers
      app.use('/', genericHandlers(router, path));
    });

    after(function() {
      delete process.env.JWTP_ALG;
      delete process.env.JWTP_URL;
      delete process.env.JWTP_DISABLE;
    })

    it('"true" GET / should return 401', async () => {
      const result = await request(app).get('/')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(401);
    });

  });


  /** disable with options */
  describe.skip('Use options and JWTP_DISABLE is set', () => {
    const token = jwt.sign({
    }, secret, { algorithm: 'HS256' });

    let options:JwtProxyOptions = {};

    before(function () {
      options = {
        algorithms: ['HS256'],
        secretOrKey: secret,
        disable: false
      };
      app.use(jwtProxy(options));
      // mock express handlers
      app.use('/', genericHandlers(router, path));
    });

    it('"false" GET / should return 401', async () => {
      const result = await request(app).get('/')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(401);
    });

  });

  describe.skip('Use options and JWTP_DISABLE is set', () => {
    const token = jwt.sign({
    }, secret, { algorithm: 'HS256' });

    let options:JwtProxyOptions = {};

    before(function () {
      options = {
        algorithms: ['HS256'],
        secretOrKey: secret,
        disable: true
      };
      app.use(jwtProxy(options));
      // mock express handlers
      app.use('/', genericHandlers(router, path));
    });


    it('"true" GET / should return 200', async () => {
      const result = await request(app).get('/')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });
  });

});