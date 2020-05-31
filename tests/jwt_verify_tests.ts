/* eslint-disable no-console */
/* eslint-disable no-undef */
import { expect } from 'chai';
// import assert from 'assert';
import 'mocha';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import colors from 'colors';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { genericHandlers } from './handlers2';
import jwtProxy, { JwtProxyOptions } from '../src/index'

describe('test all http VERBS are intercepted', () => {
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
        console.error(colors.red("my error handler"));
        res.sendStatus(res.statusCode);
        //next();
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      router.all('*', (e: Error, r: Request, res: Response, n: NextFunction) => {
        console.error(colors.red("my error handler"));
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
  describe('different signature', () => {
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

    it('GET should be 200', (done) => {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
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

    it('GET should be 200', (done) => {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
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

    it('GET should be 401', (done) => {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
        .expect(401, done);
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

    it('GET should be 401', (done) => {
      request(app)
        .get(path)
        .set('Accept', 'application/json')
        .expect(401, done);
    });
  });

});
