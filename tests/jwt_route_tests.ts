/* eslint-disable no-undef */
import { expect } from 'chai';
// import assert from 'assert';
import 'mocha';
import express, {  } from 'express';
import request from 'supertest';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { genericHandlers } from './handlers2';
import jwtProxy, { JwtProxyOptions } from '../src/index'

describe('using a base app url', () => {

  const secret = "notasecret";


  describe('first app with /contoso/v1 root', () => {
    const app = express();
    const router = express.Router();
    const rootPath = '/contonso/v1';
    

    //path needs to prefix this.
    const testOptions: JwtProxyOptions = {
      excluded:
        [
          rootPath + '/clear'],
      secretOrKey: secret,
      algorithms: ["HS256"]
    }


    before(function () {
      app.use(jwtProxy(testOptions));
      // mock express handlers
      router.use(rootPath, genericHandlers(router, '/'));
      router.use(rootPath, genericHandlers(router, '/clear'));
      router.use(rootPath, genericHandlers(router, '/clear/sub'));
      router.use(rootPath, genericHandlers(router, '/protected'));
      router.use(rootPath, genericHandlers(router, '/protected/sub'));
    });


    it('GET /clear should return 404', async () => {
      const result = await request(app).get('/contonso/v1/clear')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(404);
    });

    it('GET /clear/sub should return 401', async () => {
      const result = await request(app).get('/contonso/v1/clear/sub')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(401);
    });

    it('GET /clear/file should return 401', async () => {
      const result = await request(app).get('/contonso/v1/clear/sub')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(401);
    });

    it('GET / should return 401', async () => {
      const result = await request(app).get('/contonso/v1/')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(401);
    });

    it('GET /protected should return 401', async () => {
      const result = await request(app).get('/contonso/v1/protected')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(401);
    });
    it('GET /protected/sub should return 401', async () => {
      const result = await request(app).get('/contonso/v1/protected/sub')
      //.set('Authorization', 'Bearer ' + token);
      expect(result.status).to.eq(401);
    });
  })

});