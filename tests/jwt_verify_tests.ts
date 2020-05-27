/* eslint-disable no-undef */
import { expect } from 'chai';
// import assert from 'assert';
import 'mocha';
import express, { Router, Request, Response, NextFunction} from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const handlers = require('./handlers2');

import jwtProxy from '../src/index'

import { IncomingHttpHeaders } from 'http';

/** this allows adding custom headers 
 * Request.Headers comes from root http objedct
*/
declare module 'http' {
    interface IncomingHttpHeaders {
        'Authorization'?: string
    }
}

function genericHandlers(router: Router, path: string) {
    router.get(path, handlers.get);
    router.post(path, handlers.post);
    router.put(path, handlers.put);
    router.head(path, handlers.head);
    router.options(path, handlers.options);
    return router;
  }
  
  describe('TBD tests', function () {
    describe('test all http VERBS are intercepted', function () {
      const app = express();
      const router = express.Router();
      const token = jwt.sign({foo: 'bar'}, 'secretgoeshere');
      const path = '/';

      before(function () {
        // mocker..
        router.all('*', function (req: Request, res: Response, next:NextFunction) {
          req.headers.Authorization = 'Bearer ' + token;
          next();
        });
        // Norml middleware usage..0
        router.all('*', jwtProxy("foo"));
        // mock express handlers
        app.use('/', genericHandlers(router, path));

        // this supresses the stack trace - std Express error handler
        app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
            //console.error(error);
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
      it('HEAD should be 200', function (done) {
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
  });
  

