"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const debug_1 = __importDefault(require("debug"));
const colors_1 = __importDefault(require("colors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HttpException_1 = require("./HttpException");
const JwksHelper_1 = require("./JwksHelper");
dotenv_1.default.config();
const logger = debug_1.default('jwtproxy:info');
const logDebug = debug_1.default('jwtproxy:debug');
const tokenPrefix = "Bearer "; // is 7 characters
const failedCode = 401;
function jwtProxy(options) {
    return async function jwtVerifyMiddleware(request, response, next) {
        /** note that we provide the error to the next() function to allow
         * default express or the defined error handler to handle the error. for express
         * you must override the handler or provide env variable NODE_ENV=production if you
         * desire to NOT have the stack trace emitted.
        */
        logger('verifying a jwt token with options %o' + options);
        const authHeader = request.headers.authorization; //.authorization.get('Authorization');
        try {
            if (authHeader === undefined || authHeader === null) {
                logger('authHeader is null/absent - returning 401: %o', authHeader);
                //response.statusCode = failedCode;
                //TODO: can we pass this to next() but suppress annoying mocha output of the 
                //TODO: entire stack trace.
                throw new HttpException_1.NoJwtException();
            }
            if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith(tokenPrefix))) {
                logger('%s prefix absent - returning 401: %o', tokenPrefix, authHeader);
                //response.statusCode = failedCode;
                throw new HttpException_1.NoJwtException();
            }
            //grap token from the header
            const token = (authHeader) ? authHeader.substring(tokenPrefix.length, authHeader.length) : '';
            //pre-flight decode to get the kid, alg.
            const preFlightToken = jsonwebtoken_1.default.decode(token, { complete: true });
            let alg = 'HS256';
            if (tokenHeader && typeof tokenHeader == 'object' && tokenHeader['header'] && tokenHeader['header']['alg']) {
                alg = tokenHeader['header']['alg'];
            }
            logDebug(colors_1.default.red('tokenHeader %o'), alg);
            //TODO: need a factory...
            const verifyOption = await JwksHelper_1.getVerifyOptions(options);
            const decodedToken = jsonwebtoken_1.default.verify(token, 'sharedsecret', verifyOption);
            next();
        }
        catch (error) {
            logger(colors_1.default.red('failed jwt validation %o'), error.message);
            response.set({
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Expires': '-1',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'X-XSS-Protection': '1',
            }).status(failedCode).send();
        }
    };
}
exports.default = jwtProxy;
//# sourceMappingURL=index.js.map