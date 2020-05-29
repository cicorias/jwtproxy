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
/** we need root, /protected and /clear routes in the app */
describe('Using NO Token', () => {
    describe('Protect all paths except excluded[] paths', () => {
        const app = express_1.default();
        const router = express_1.default.Router();
        const path = '/';
        const testOptions = {
            excluded: [
                '/clear'
            ],
            secretOrKey: publicKey,
            algorithms: ["RS256"]
        };
        const token = jsonwebtoken_1.default.sign({
            aud: 'nobody',
        }, privateKey, { algorithm: 'RS256' });
        before(function () {
            app.use(index_1.default(testOptions));
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
            app.use('/clear', handlers2_1.genericHandlers(router, path));
            app.use('/clear/sub', handlers2_1.genericHandlers(router, path));
            app.use('/protected', handlers2_1.genericHandlers(router, path));
            app.use('/protected/sub', handlers2_1.genericHandlers(router, path));
        });
        it('GET /clear should return 200', async () => {
            const result = await supertest_1.default(app).get('/clear');
            //.set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
        it('GET /clear/sub should return 200', async () => {
            const result = await supertest_1.default(app).get('/clear/sub');
            //.set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
        it('GET /clear/file should return 200', async () => {
            const result = await supertest_1.default(app).get('/clear/sub');
            //.set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
        it('GET / should return 401', async () => {
            const result = await supertest_1.default(app).get('/');
            //.set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(401);
        });
        it('GET /protected should return 401', async () => {
            const result = await supertest_1.default(app).get('/protected');
            //.set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(401);
        });
        it('GET /protected/sub should return 401', async () => {
            const result = await supertest_1.default(app).get('/protected/sub');
            //.set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(401);
        });
    });
});
describe('Using VALID Token', () => {
    describe('Protect all paths except excluded[] paths', () => {
        const app = express_1.default();
        const router = express_1.default.Router();
        const path = '/';
        const testOptions = {
            excluded: [
                '/clear'
            ],
            secretOrKey: publicKey,
            algorithms: ["RS256"]
        };
        const token = jsonwebtoken_1.default.sign({
            aud: 'nobody',
        }, privateKey, { algorithm: 'RS256' });
        before(function () {
            app.use(index_1.default(testOptions));
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
            app.use('/clear', handlers2_1.genericHandlers(router, path));
            app.use('/clear/sub', handlers2_1.genericHandlers(router, path));
            app.use('/protected', handlers2_1.genericHandlers(router, path));
            app.use('/protected/sub', handlers2_1.genericHandlers(router, path));
        });
        it('GET /clear should return 200', async () => {
            const result = await supertest_1.default(app).get('/clear')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
        it('GET /clear/sub should return 200', async () => {
            const result = await supertest_1.default(app).get('/clear/sub')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
        it('GET /clear/file should return 200', async () => {
            const result = await supertest_1.default(app).get('/clear/sub')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
        it('GET / should return 200', async () => {
            const result = await supertest_1.default(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
        it('GET /protected should return 200', async () => {
            const result = await supertest_1.default(app).get('/protected')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
        it('GET /protected/sub should return 200', async () => {
            const result = await supertest_1.default(app).get('/protected/sub')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
    });
});
//# sourceMappingURL=jwt_verify_path_tests.js.map