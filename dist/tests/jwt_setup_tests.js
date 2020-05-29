"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
// import assert from 'assert';
require("mocha");
const fs_1 = __importDefault(require("fs"));
const util_1 = __importDefault(require("util"));
const readFile = util_1.default.promisify(fs_1.default.readFile);
describe('Check if PEM and Jwks files are present', () => {
    it('file private.jwk exists', async () => {
        const rv = await readFile('./tests/private.json')
            .then(() => {
            return 'OK';
        })
            .catch(() => {
            return 'need to run generateJwksTestFiles.sh ...a';
        });
        //console.error('what i got', rv);
        chai_1.expect(rv).equal('OK');
    });
    it('file private.pem exists', async () => {
        const rv = await readFile('./tests/private.pem')
            .then(() => {
            return 'OK';
        })
            .catch(() => {
            return 'need to run generateJwksTestFiles.sh ...a';
        });
        chai_1.expect(rv).equal('OK');
    });
    it('file public.pem exists', async () => {
        const rv = await readFile('./tests/public.pem')
            .then(() => {
            return 'OK';
        })
            .catch(() => {
            return 'need to run generateJwksTestFiles.sh ...a';
        });
        chai_1.expect(rv).equal('OK');
    });
});
//# sourceMappingURL=jwt_setup_tests.js.map