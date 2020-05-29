"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
const chai_1 = require("chai");
const fs_1 = __importDefault(require("fs"));
// import assert from 'assert';
require("mocha");
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const handlers2_1 = require("./handlers2");
const index_1 = __importDefault(require("../src/index"));
const privateKey = fs_1.default.readFileSync(__dirname + '/private.pem', 'utf-8');
const publicKey = fs_1.default.readFileSync(__dirname + '/public.pem', 'utf-8');
describe('Using Environment using secret as string.', () => {
    const app = express_1.default();
    const router = express_1.default.Router();
    const path = '/';
    describe('Use ENV aud, alg, iss validation using secret as string', () => {
        const token = jsonwebtoken_1.default.sign({
            aud: 'nobody',
            iss: 'foobar'
        }, privateKey, { algorithm: 'RS256' });
        before(function () {
            app.use(index_1.default());
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
            process.env.JWTP_ALG = 'RS256';
            process.env.JWTP_URL = publicKey;
            process.env.JWTP_ISS = 'foobar';
            process.env.JWTP_AUD = 'nobody';
        });
        it('GET / should return 200', async () => {
            const result = await supertest_1.default(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
    });
    describe('Use ENV aud, alg, iss validation using secret as string', () => {
        const token = jsonwebtoken_1.default.sign({
            aud: 'nobody',
            iss: 'foobar'
        }, privateKey, { algorithm: 'RS256' });
        before(function () {
            app.use(index_1.default());
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
            process.env.JWTP_ALG = 'RS256';
            process.env.JWTP_URL = publicKey;
            process.env.JWTP_ISS = 'foobar';
            process.env.JWTP_AUD = 'nobody';
        });
        it('GET / should return 401 - invalid aud', async () => {
            process.env.JWTP_AUD = 'someone';
            const result = await supertest_1.default(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(401);
        });
        it('GET / should return 401 - invalid iss', async () => {
            process.env.JWTP_ISS = 'someone';
            const result = await supertest_1.default(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(401);
        });
        it('GET / should return 401 - invalid alg - but real', async () => {
            process.env.JWTP_ALG = 'HS256';
            const result = await supertest_1.default(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(401);
        });
        it('GET / should return 401 - invalid alg - but fake', async () => {
            process.env.JWTP_ALG = 'ZZZZ';
            const result = await supertest_1.default(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(401);
        });
    });
});
//# sourceMappingURL=jwt_verify_env_tests.js.map