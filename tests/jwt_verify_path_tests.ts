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

/** we need root, /protected and /clear routes in the app */
describe('Protect all paths except excluded[] paths', function () {
  const app = express();
  const router = express.Router();
  const path = '/';

  const testOptions: JwtProxyOptions = {
    excluded: ['/protected'],
    secretOrKey: 'secret',
    algorithms: ["HS256"]
  }

  before(function () {
    router.all('*', jwtProxy(testOptions));
    // mock express handlers
    app.use('/', genericHandlers(router, path));

  });
  it('GET /clear should return 200', async () => {
    const result = await request(app).get('/clear');
    expect(result.status).to.eq(200);
  });
  it('GET / should return 401', async () => {
    const result = await request(app).get('/');
    expect(result.status).to.eq(401);
  });
  it('GET /protected should return 401', async () => {
    const result = await request(app).get('/protected');
    expect(result.status).to.eq(401);
  });
});