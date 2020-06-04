/* eslint-disable no-console */
/* eslint-disable no-undef */
import { expect } from 'chai';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// import assert from 'assert';
import 'mocha';
import request from 'supertest';
import jwtProxy, { JwtProxyOptions } from '../src/index';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { genericHandlers } from './handlers2';

describe('test all http VERBS are intercepted', () => {
  describe('GET / header presence first ', () => {
    const app = express();
    const router = express.Router();
    const path = '/';

    before(function () {
      app.use(jwtProxy());
      // mock express handlers
      app.use('/', genericHandlers(router, path));
    });

    it('GET should return 401', async () => {
      const result = await request(app).get('/');
      expect(result.status).to.eq(401|403);
    });
    it('POST should return 401', async () => {
      const result = await request(app).post('/');
      expect(result.status).to.eq(401|403);
    });
    it('PUT should return 401', async () => {
      const result = await request(app).put('/');
      expect(result.status).to.eq(401|403);
    });
    it('OPTIONS should return 401', async () => {
      const result = await request(app).options('/');
      expect(result.status).to.eq(401|403);
    });
    it('HEAD should return 401', async () => {
      const result = await request(app).head('/');
      expect(result.status).to.eq(401|403);
    });
    it('DELETE should return 401', async () => {
      const result = await request(app).delete('/');
      expect(result.status).to.eq(401|403);
    });
  });

  /** tests expected to fail due to signature or key differences */
  describe('different signature', () => {
    const app = express();
    const router = express.Router();
    const path = '/';

    before(function () {
      // Norml middleware usage..0
      app.use(jwtProxy());
      // mock express handlers
      app.use('/', genericHandlers(router, path));

    });

    it('GET should be 401', () => {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
        .expect(401);
    });
    it('PUT should be 401', () => {
      request(app)
        .put(path)
        .set('Accept', 'application/json')
        .expect(401);
    });
    it('POST should be 401', () => {
      request(app)
        .post(path)
        .set('Accept', 'application/json')
        .expect(401);
    });
  });


  /** test that pass  */
  describe('same signature', () => {
    const app = express();
    const router = express.Router();
    const secret = 'sharedsecret';
    const token = jwt.sign({ foo: 'bar' }, secret);
    const path = '/';
    const options: JwtProxyOptions = {
      secretOrKey: secret,
      algorithms: ['HS256']
    }

    before(function () {
      // Norml middleware usage..0
      app.use(jwtProxy(options));
      // mock express handlers
      app.use('/', genericHandlers(router, path));

    });

    it('GET should be 200', (done) => {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .expect(200, done);
    });
  });
});

describe('Mandatory algorithms check in options', () => {
  describe('Verify token with algorithm-Pass', () => {
    const app = express();
    const router = express.Router();
    const secret = 'sharedsecret';
    const token = jwt.sign({ foo: 'bar' }, secret);
    const path = '/';
    const options: JwtProxyOptions = {
      secretOrKey: secret,
      algorithms: ['HS256']
    }

    before(function () {
      // Norml middleware usage..0
      app.use(jwtProxy(options));
      // mock express handlers
      app.use('/', genericHandlers(router, path));

      // this supresses the stack trace - std Express error handler
      app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(error.message);
        res.sendStatus(res.statusCode);
        next();
      });

    });

    it('GET should be 200', (done) => {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .expect(200, done);
    });



  });

  /** 
   * here we're saying if you supply the options, then it HAS to have 
   * valid algorithms and be present.
   */
  describe('Verify token with algorithm empty array-Fail', () => {
    const app = express();
    const router = express.Router();
    const secret = 'sharedsecret';
    const token = jwt.sign({ foo: 'bar' }, secret);
    const path = '/';
    const options: JwtProxyOptions = {
      secretOrKey: secret,
      algorithms: []
    }

    before(function () {
      // Norml middleware usage..0
      app.use(jwtProxy(options));
      // mock express handlers
      app.use('/', genericHandlers(router, path));

    });

    it('GET should be 401', (done) => {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
        .set('Authorization', 'Bearer ' + token)        
        .expect(401|403, done);
    });
  });

  describe('Verify token with algorithm NO array-Fail', () => {
    const app = express();
    const router = express.Router();
    const secret = 'sharedsecret';
    const token = jwt.sign({ foo: 'bar' }, secret);
    const path = '/';
    const options = { //}: JwtProxyOptions = {
      secretOrKey: secret
    }

    before(function () {
      // Norml middleware usage..0
      app.use(jwtProxy(options));
      // mock express handlers
      app.use('/', genericHandlers(router, path));

    });

    it('GET should be 401', (done) => {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
        .set('Authoriztion', 'Bearer ' + token)
        .expect(401|403, done);
    });
  });

});
