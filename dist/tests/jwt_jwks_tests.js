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
describe.skip('Using jwks url endpoint', () => {
    const app = express_1.default();
    const router = express_1.default.Router();
    const path = '/';
    describe('Use ENV aud, alg, iss validation using secret as string', () => {
        const token = jsonwebtoken_1.default.sign({
            aud: 'nobody',
            iss: 'foobar'
        }, privateKey, {
            algorithm: 'RS256',
            keyid: 'foobar'
        });
        const options = {
            jwksUrl: 'http://localhost:5500/tests/private.json'
        };
        before(function () {
            app.use(index_1.default(options));
            // mock express handlers
            app.use('/', handlers2_1.genericHandlers(router, path));
        });
        it('GET / should return 200', async () => {
            const result = await supertest_1.default(app).get('/')
                .set('Authorization', 'Bearer ' + token);
            chai_1.expect(result.status).to.eq(200);
        });
    });
});
//# sourceMappingURL=jwt_jwks_tests.js.map