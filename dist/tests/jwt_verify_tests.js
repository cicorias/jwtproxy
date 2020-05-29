"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
const chai_1 = require("chai");
// import assert from 'assert';
require("mocha");
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const colors_1 = __importDefault(require("colors"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const handlers2_1 = require("./handlers2");
const index_1 = __importDefault(require("../src/index"));
describe('test all http VERBS are intercepted', () => {
    describe('GET / header presence first ', () => {
        const app = express_1.default();
        const router = express_1.default.Router();
        const path = '/';
        before(function () {
            router.all('*', index_1.default());
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
            // this supresses the stack trace - std Express error handler
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            app.use((error, req, res, next) => {
                console.error(colors_1.default.green("my error handler"));
                res.sendStatus(res.statusCode);
                //next();
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            router.all('*', (e, r, res, n) => {
                console.error(colors_1.default.blue("my error handler"));
            });
        });
        it('GET should return 401', async () => {
            const result = await supertest_1.default(app).get('/');
            chai_1.expect(result.status).to.eq(401);
        });
        it('POST should return 401', async () => {
            const result = await supertest_1.default(app).post('/');
            chai_1.expect(result.status).to.eq(401);
        });
        it('PUT should return 401', async () => {
            const result = await supertest_1.default(app).put('/');
            chai_1.expect(result.status).to.eq(401);
        });
        it('OPTIONS should return 401', async () => {
            const result = await supertest_1.default(app).options('/');
            chai_1.expect(result.status).to.eq(401);
        });
        it('HEAD should return 401', async () => {
            const result = await supertest_1.default(app).head('/');
            chai_1.expect(result.status).to.eq(401);
        });
        it('DELETE should return 401', async () => {
            const result = await supertest_1.default(app).delete('/');
            chai_1.expect(result.status).to.eq(401);
        });
    });
    /** tests expected to fail due to signature or key differences */
    describe('different signature', () => {
        const app = express_1.default();
        const router = express_1.default.Router();
        const secret = 'nonsharedsecret';
        const token = jsonwebtoken_1.default.sign({ foo: 'bar' }, secret);
        const path = '/';
        before(function () {
            // mocker..
            router.all('*', function (req, res, next) {
                req.headers.authorization = 'Bearer ' + token;
                next();
            });
            // Norml middleware usage..0
            router.all('*', index_1.default());
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
            // this supresses the stack trace - std Express error handler
            app.use((error, req, res, next) => {
                res.sendStatus(res.statusCode);
                next();
            });
        });
        it('GET should be 401', (done) => {
            supertest_1.default(app)
                .get(path)
                .set('Accept', 'application/json')
                .expect(401, done);
        });
        it('PUT should be 401', (done) => {
            supertest_1.default(app)
                .put(path)
                .set('Accept', 'application/json')
                .expect(401, done);
        });
        it('POST should be 401', (done) => {
            supertest_1.default(app)
                .post(path)
                .set('Accept', 'application/json')
                .expect(401, done);
        });
    });
    /** test that pass  */
    describe('same signature', () => {
        const app = express_1.default();
        const router = express_1.default.Router();
        const secret = 'sharedsecret';
        const token = jsonwebtoken_1.default.sign({ foo: 'bar' }, secret);
        const path = '/';
        const options = {
            secretOrKey: secret,
            algorithms: ['HS256']
        };
        before(function () {
            // mocker..
            router.all('*', function (req, res, next) {
                req.headers.authorization = 'Bearer ' + token;
                next();
            });
            // Norml middleware usage..0
            router.all('*', index_1.default(options));
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
            // this supresses the stack trace - std Express error handler
            app.use((error, req, res, next) => {
                console.error(error.message);
                res.sendStatus(res.statusCode);
                next();
            });
        });
        it('GET should be 200', (done) => {
            supertest_1.default(app)
                .get(path)
                .set('Accept', 'application/json')
                .expect(200, done);
        });
    });
});
describe('Mandatory algorithms check in options', () => {
    describe('Verify token with algorithm-Pass', () => {
        const app = express_1.default();
        const router = express_1.default.Router();
        const secret = 'sharedsecret';
        const token = jsonwebtoken_1.default.sign({ foo: 'bar' }, secret);
        const path = '/';
        const options = {
            secretOrKey: secret,
            algorithms: ['HS256']
        };
        before(function () {
            // mocker..
            router.all('*', function (req, res, next) {
                req.headers.authorization = 'Bearer ' + token;
                next();
            });
            // Norml middleware usage..0
            router.all('*', index_1.default(options));
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
            // this supresses the stack trace - std Express error handler
            app.use((error, req, res, next) => {
                console.error(error.message);
                res.sendStatus(res.statusCode);
                next();
            });
        });
        it('GET should be 200', (done) => {
            supertest_1.default(app)
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
        const app = express_1.default();
        const router = express_1.default.Router();
        const secret = 'sharedsecret';
        const token = jsonwebtoken_1.default.sign({ foo: 'bar' }, secret);
        const path = '/';
        const options = {
            secretOrKey: secret,
            algorithms: []
        };
        before(function () {
            // mocker..
            router.all('*', function (req, res, next) {
                req.headers.authorization = 'Bearer ' + token;
                next();
            });
            // Norml middleware usage..0
            router.all('*', index_1.default(options));
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
            // this supresses the stack trace - std Express error handler
            app.use((error, req, res, next) => {
                console.error(error.message);
                res.sendStatus(res.statusCode);
                next();
            });
        });
        it('GET should be 401', (done) => {
            supertest_1.default(app)
                .get(path)
                .set('Accept', 'application/json')
                .expect(401, done);
        });
    });
    describe('Verify token with algorithm NO array-Fail', () => {
        const app = express_1.default();
        const router = express_1.default.Router();
        const secret = 'sharedsecret';
        const token = jsonwebtoken_1.default.sign({ foo: 'bar' }, secret);
        const path = '/';
        const options = {
            secretOrKey: secret
        };
        before(function () {
            // mocker..
            router.all('*', function (req, res, next) {
                req.headers.authorization = 'Bearer ' + token;
                next();
            });
            // Norml middleware usage..0
            router.all('*', index_1.default(options));
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
            // this supresses the stack trace - std Express error handler
            app.use((error, req, res, next) => {
                console.error(error.message);
                res.sendStatus(res.statusCode);
                next();
            });
        });
        it('GET should be 401', (done) => {
            supertest_1.default(app)
                .get(path)
                .set('Accept', 'application/json')
                .expect(401, done);
        });
    });
});
//# sourceMappingURL=jwt_verify_tests.js.map