/* eslint-disable no-undef */
import { expect } from 'chai';
import fs from 'fs';
// import assert from 'assert';
import 'mocha';
import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import colors from 'colors';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { genericHandlers } from './handlers2';
import jwtProxy, { JwtProxyOptions } from '../src/index'

const privateKey = fs.readFileSync(__dirname + '/private.pem', 'utf-8');
const publicKey = fs.readFileSync(__dirname + '/public.pem', 'utf-8');

describe('Using Environment using secret as string.', () => {
    const app = express();
    const router = express.Router();
    const path = '/';

    describe('Use ENV aud, alg, iss validation using secret as string', () => {
        const token = jwt.sign({
            aud: 'nobody',
            iss: 'foobar'
        }, privateKey, { algorithm: 'RS256' });

        before(function () {
            app.use(jwtProxy());
            // mock express handlers
            app.use('/', genericHandlers(router, path));
            process.env.JWTP_ALG = 'RS256';
            process.env.JWTP_URL = publicKey;
            process.env.JWTP_ISS = 'foobar';
            process.env.JWTP_AUD = 'nobody';
        });

        it('GET / should return 200', async () => {
            const result = await request(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            expect(result.status).to.eq(200);
        });
    });


    
    describe('Use ENV aud, alg, iss validation using secret as string', () => {
        const token = jwt.sign({
            aud: 'nobody',
            iss: 'foobar'
        }, privateKey, { algorithm: 'RS256' });

        before(function () {
            app.use(jwtProxy());
            // mock express handlers
            app.use('/', genericHandlers(router, path));
            process.env.JWTP_ALG = 'RS256';
            process.env.JWTP_URL = publicKey;
            process.env.JWTP_ISS = 'foobar';
            process.env.JWTP_AUD = 'nobody';
        });

        it('GET / should return 401 - invalid aud', async () => {
            process.env.JWTP_AUD = 'someone';
            const result = await request(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            expect(result.status).to.eq(401);
        });

        it('GET / should return 401 - invalid iss', async () => {
            process.env.JWTP_ISS = 'someone';
            const result = await request(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            expect(result.status).to.eq(401);
        });

        it('GET / should return 401 - invalid alg - but real', async () => {
            process.env.JWTP_ALG = 'HS256';
            const result = await request(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            expect(result.status).to.eq(401);
        });

        it('GET / should return 401 - invalid alg - but fake', async () => {
            process.env.JWTP_ALG = 'ZZZZ';
            const result = await request(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            expect(result.status).to.eq(401);
        });
    });
})