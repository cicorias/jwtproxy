"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const debug_1 = __importDefault(require("debug"));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HttpException_1 = require("./HttpException");
dotenv_1.default.config();
const logger = debug_1.default('jwtproxy');
function jwtProxy(options) {
    return async function jwtVerifyMiddleware(request, response, next) {
        /** note that we provide the error to the next() function to allow
         * default express or the defined error handler to handle the error. for express
         * you must override the handler or provide env variable NODE_ENV=production if you
         * desire to NOT have the stack trace emitted.
        */
        logger('verifying a jwt token...' + options);
        const authHeader = request.get('authorization');
        if (authHeader == null) {
            response.statusCode = 401;
            next(new HttpException_1.NoJwtException());
        }
        else {
            next();
        }
    };
}
exports.default = jwtProxy;
//# sourceMappingURL=index.js.map