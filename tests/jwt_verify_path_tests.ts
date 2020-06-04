/* eslint-disable no-undef */
import { expect } from 'chai';
import express from 'express';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import 'mocha';
import request from 'supertest';
import jwtProxy, { JwtProxyOptions } from '../src/index';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { genericHandlers } from './handlers2';

const privateKey = fs.readFileSync(__dirname + '/private.pem', 'utf-8');
const publicKey = fs.readFileSync(__dirname + '/public.pem', 'utf-8');

/** we need root, /protected and /clear routes in the app */

describe('Using NO Token', () => {
  describe('Protect all paths except excluded[] paths', () => {
    const app = express();
    const router = express.Router();
    const path = '/';

    const testOptions: JwtProxyOptions = {
      excluded:
        [
          '/clear'],
      secretOrKey: publicKey,
      algorithms: ["RS256"]
    }

    before(function () {
      app.use(jwtProxy(testOptions));
      // mock express handlers
      app.use('/', genericHandlers(router, path));
      app.use('/clear', genericHandlers(router, path));
      app.use('/clear/sub', genericHandlers(router, path));
      app.use('/protected', genericHandlers(router, path));
      app.use('/protected/sub', genericHandlers(router, path));
    });


    it('GET /clear should return 200', async () => {
      const result = await request(app).get('/clear')
      expect(result.status).to.eq(200);
    });
    it('GET /clear/sub should return 401', async () => {
      const result = await request(app).get('/clear/sub')
      expect(result.status).to.eq(401|403);
    });

    it('GET /clear/file should return 401', async () => {
      const result = await request(app).get('/clear/sub')
      expect(result.status).to.eq(401|403);
    });

    it('GET / should return 401', async () => {
      const result = await request(app).get('/')
      expect(result.status).to.eq(401|403);
    });

    it('GET /protected should return 401', async () => {
      const result = await request(app).get('/protected')
      expect(result.status).to.eq(401|403);
    });
    it('GET /protected/sub should return 401', async () => {
      const result = await request(app).get('/protected/sub')
      expect(result.status).to.eq(401|403);
    });
  });
});

describe('Using VALID Token', () => {
  describe('Protect all paths except excluded[] paths', () => {
    const app = express();
    const router = express.Router();
    const path = '/';

    const testOptions: JwtProxyOptions = {
      excluded: [
        '/clear'],
      secretOrKey: publicKey,
      algorithms: ["RS256"]
    }

    const token = jwt.sign({
      aud: 'nobody',
    }, privateKey, { algorithm: 'RS256' });

    before(function () {
      app.use(jwtProxy(testOptions));
      // mock express handlers
      app.use('/', genericHandlers(router, path));
      app.use('/clear', genericHandlers(router, path));
      app.use('/clear/sub', genericHandlers(router, path));
      app.use('/protected', genericHandlers(router, path));
      app.use('/protected/sub', genericHandlers(router, path));
    });


    it('GET /clear should return 200', async () => {
      const result = await request(app).get('/clear')
        .set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });
    it('GET /clear/sub should return 200', async () => {
      const result = await request(app).get('/clear/sub')
        .set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });

    it('GET /clear/file should return 200', async () => {
      const result = await request(app).get('/clear/sub')
        .set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });

    it('GET / should return 200', async () => {
      const result = await request(app).get('/')
        .set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });

    it('GET /protected should return 200', async () => {
      const result = await request(app).get('/protected')
        .set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });
    it('GET /protected/sub should return 200', async () => {
      const result = await request(app).get('/protected/sub')
        .set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });
  });

  describe('Aud with multiple values with all invalid values', () => {
    const app = express();
    const router = express.Router();
    const path = '/';

    const testOptions: JwtProxyOptions = {
      excluded: [
        '/clear'],
      secretOrKey: publicKey,
      algorithms: ["RS256"],
      audience: 'noone;someone'
    }

    const token = jwt.sign({
      aud: 'nobody',
    }, privateKey, { algorithm: 'RS256' });

    before(function () {
      app.use(jwtProxy(testOptions));
      // mock express handlers
      app.use('/', genericHandlers(router, path));
    });


    it('GET / should return 403-invalid aud', async () => {
      const result = await request(app).get('/')
        .set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(403);
    });

  });

  describe('Aud with multiple values with one valid value', () => {
    const app = express();
    const router = express.Router();
    const path = '/';

    const testOptions: JwtProxyOptions = {
      excluded: [
        '/clear'],
      secretOrKey: publicKey,
      algorithms: ["RS256"],
      audience: 'nobody;someone'
    }

    const token = jwt.sign({
      aud: 'nobody',
    }, privateKey, { algorithm: 'RS256' });

    before(function () {
      app.use(jwtProxy(testOptions));
      // mock express handlers
      app.use('/', genericHandlers(router, path));
    });


    it('GET / should return 200-valid aud', async () => {
      const result = await request(app).get('/')
        .set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });

  });

});

describe('Using NO Token', () => {
  describe('Protect all paths except excluded[] paths-multiple', () => {
    const app = express();
    const router = express.Router();
    const path = '/';

    const testOptions: JwtProxyOptions = {
      excluded:
        [
          '/clear', '/clear/sub'],
      secretOrKey: publicKey,
      algorithms: ["RS256"]
    }

    before(function () {
      app.use(jwtProxy(testOptions));
      // mock express handlers
      app.use('/', genericHandlers(router, path));
      app.use('/clear', genericHandlers(router, path));
      app.use('/clear/sub', genericHandlers(router, path));
      app.use('/protected', genericHandlers(router, path));
      app.use('/protected/sub', genericHandlers(router, path));
    });


    it('GET /clear should return 200', async () => {
      const result = await request(app).get('/clear')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });
    it('GET /clear/sub should return 200', async () => {
      const result = await request(app).get('/clear/sub')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(200);
    });
  });
});