/* eslint-disable no-undef */
import { expect } from 'chai';
// import assert from 'assert';
import 'mocha';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import colors from 'colors';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import {genericHandlers} from './handlers2';
import jwtProxy, { JwtProxyOptions } from '../src/index'

describe.skip('test all http VERBS are intercepted', function () {
  describe('GET / header presence first ', () => {
    const app = express();
    const router = express.Router();
    const path = '/';

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

    it('GET should return 401', async () => {
      const result = await request(app).get('/');
      expect(result.status).to.eq(401);
    });
    it('POST should return 401', async () => {
      const result = await request(app).post('/');
      expect(result.status).to.eq(401);
    });
    it('PUT should return 401', async () => {
      const result = await request(app).put('/');
      expect(result.status).to.eq(401);
    });
    it('OPTIONS should return 401', async () => {
      const result = await request(app).options('/');
      expect(result.status).to.eq(401);
    });
    it('HEAD should return 401', async () => {
      const result = await request(app).head('/');
      expect(result.status).to.eq(401);
    });
    it('DELETE should return 401', async () => {
      const result = await request(app).delete('/');
      expect(result.status).to.eq(401);
    });
  });

  /** tests expected to fail due to signature or key differences */
  describe.skip('different signature', function () {
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


