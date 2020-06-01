"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
var dotenv_1 = __importDefault(require("dotenv"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var index_1 = __importDefault(require("../dist/index"));
/** This is a demo server used to test and validate the actual middleware which is in index.ts */
dotenv_1.default.config();
// https://dev.to/aligoren/developing-an-express-application-using-typescript-3b1
var loggerMiddleware = function (req, resp, next) {
    console.log('Request logged:', req.method, req.path);
    next();
};
var sharedSecret = "notasecret";
/** this route is to be protected */
var UserController = /** @class */ (function () {
    function UserController() {
        var _this = this;
        this.sampleUsers = ['john', 'paul', 'ringo'];
        this.router = express_1.default.Router();
        this.getAllUsers = function (request, response) {
            return response.send(_this.sampleUsers);
        };
        this.router.get('/users', this.getAllUsers);
    }
    return UserController;
}());
/** this route is OPEN  */
var StatusController = /** @class */ (function () {
    function StatusController() {
        var _this = this;
        this.status = 'all OK';
        this.router = express_1.default.Router();
        this.getStatus = function (request, response) {
            return response.send(_this.status);
        };
        this.router.get('/status', this.getStatus);
    }
    return StatusController;
}());
/** this route provides token signing for testing only. */
var SignController = /** @class */ (function () {
    function SignController() {
        var _this = this;
        this.status = 'use POST with a json jwt payload';
        this.router = express_1.default.Router();
        this.getSign = function (request, response) {
            return response.send(_this.status);
        };
        this.sign = function (request, response) {
            var options = { algorithm: 'HS256' };
            var rv = jsonwebtoken_1.default.sign(request.body, sharedSecret, options);
            return response.send(rv);
        };
        this.router.get('/sign', this.getSign);
        this.router.post('/sign', this.sign);
    }
    return SignController;
}());
var App = /** @class */ (function () {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function App(appInit) {
        this.app = express_1.default();
        this.port = appInit.port;
        this.middlewares(appInit.middleWares);
        this.routes(appInit.controllers);
        this.assets();
        this.template();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    App.prototype.middlewares = function (middleWares) {
        var _this = this;
        middleWares.forEach(function (middleWare) {
            _this.app.use(middleWare);
        });
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    App.prototype.routes = function (controllers) {
        var _this = this;
        controllers.forEach(function (controller) {
            _this.app.use('/', controller.router);
        });
    };
    App.prototype.assets = function () {
        //this.app.use(express.static('public'))
        //this.app.use(express.static('views'))
    };
    App.prototype.template = function () {
        //this.app.set('view engine', 'pug')
    };
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    App.prototype.listen = function () {
        var _this = this;
        this.app.listen(this.port, function () {
            console.log("App listening on the http://localhost:" + _this.port);
        });
    };
    return App;
}());
var options = {
    algorithms: ['HS256'],
    excluded: ['/status', '/sign'],
    secretOrKey: sharedSecret
};
var appWrapper = new App({
    port: (!process.env.PORT) ? 5000 : parseInt(process.env.PORT),
    controllers: [
        new UserController(),
        new StatusController(),
        new SignController()
    ],
    middleWares: [
        index_1.default(options),
        loggerMiddleware,
        body_parser_1.default.json(),
    ]
});
//test if running in mocha
var isInTest = typeof global.it === 'function';
//running as a proper listener process NOT under Mocha
if (!isInTest) {
    appWrapper.listen();
}
else {
    //running under mocha, just forward the status code; suppress the stack trace
    appWrapper.app.use(function (error, req, res, next) {
        //console.error(error);
        res.sendStatus(res.statusCode);
        next();
    });
}
exports.default = appWrapper.app;
