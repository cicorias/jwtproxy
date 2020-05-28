/* eslint-disable no-undef */
import { expect } from 'chai';
// import assert from 'assert';
import 'mocha';
import express, { Router, Request, Response, NextFunction } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import colors from 'colors';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const handlers = require('./handlers2');

import jwtProxy, { JwtProxyOptions } from '../src/index'

function genericHandlers(router: Router, path: string) {
  router.get(path, handlers.get);
  router.post(path, handlers.post);
  router.put(path, handlers.put);
  router.head(path, handlers.head);
  router.options(path, handlers.options);
  return router;
}

describe('test all http VERBS are intercepted', function () {

  describe('GET / header presence first ', () => {
    const app = express();
    const router = express.Router();
    const path = '/';
    process.env.NODE_ENV='production';

    before(function () {
      router.all('*', jwtProxy());
      // mock express handlers
      app.use('/', genericHandlers(router, path));

      // this supresses the stack trace - std Express error handler
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(colors.green("my error handler"));
        res.sendStatus(res.statusCode);
        //next();
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      router.all('*', (e:Error,r:Request,res:Response,n:NextFunction) => {
        console.error(colors.blue("my error handler"));
      })
    });
    it('should return 401', async () => {
      const result = await request(app).get('/');
      expect(result.status).to.eq(401);
      
    });
      
    it('should return 401', async () => {
      const result = await request(app).get('/users');
      expect(result.status).to.eq(401);
    });
  });


  /** tests expected to fail due to signature or key differences */
  describe('different signature', function () {
    const app = express();
    const router = express.Router();
    const secret = 'nonsharedsecret';
    const token = jwt.sign({ foo: 'bar' }, secret);
    const path = '/';

    before(function () {
      // mocker..
      router.all('*', function (req: Request, res: Response, next: NextFunction) {
        req.headers.authorization = 'Bearer ' + token;
        next();
      });
      // Norml middleware usage..0
      router.all('*', jwtProxy());
      // mock express handlers
      app.use('/', genericHandlers(router, path));

      // this supresses the stack trace - std Express error handler
      app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        res.sendStatus(res.statusCode);
        next();
      });

    });

    it('GET should be 401', function (done) {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
        .expect(401, done);
    });
    it('PUT should be 401', function (done) {
      request(app)
        .put(path)
        .set('Accept', 'application/json')
        .expect(401, done);
    });
    it('POST should be 401', function (done) {
      request(app)
        .post(path)
        .set('Accept', 'application/json')
        .expect(401, done);
    });
    it('HEAD should be 401', function (done) {
      request(app)
        .head(path)
        .set('Accept', 'application/json')
        .expect(401, done);
    });
    it('OPTION should be 401', function (done) {
      request(app)
        .options(path)
        .set('Accept', 'application/json')
        .expect(401, done);
    });
  });


  /** test that pass  */
  describe('same signature', function () {
    const app = express();
    const router = express.Router();
    const secret = 'sharedsecret';
    const token = jwt.sign({ foo: 'bar' }, secret);
    const path = '/';
    const options:JwtProxyOptions = {
      secretOrKey: secret,
      algorithms: ['HS256']
    }

    before(function () {
      // mocker..
      router.all('*', function (req: Request, res: Response, next: NextFunction) {
        req.headers.authorization = 'Bearer ' + token;
        next();
      });
      // Norml middleware usage..0
      router.all('*', jwtProxy(options));
      // mock express handlers
      app.use('/', genericHandlers(router, path));

      // this supresses the stack trace - std Express error handler
      app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(error.message);
        res.sendStatus(res.statusCode);
        next();
      });

    });

    it('GET should be 200', function (done) {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
        .expect(200, done);
    });
  });
});

