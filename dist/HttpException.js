"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidJwtToken = exports.InvalidOption = exports.NoJwtException = exports.HttpException = void 0;
class HttpException extends Error {
    constructor(status, message, baseError) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
exports.HttpException = HttpException;
class NoJwtException extends HttpException {
    constructor() {
        super(401, 'Jwt missing from Request');
    }
}
exports.NoJwtException = NoJwtException;
class InvalidOption extends HttpException {
    constructor(msg) {
        super(401, 'Invalid option specified: ' + msg);
    }
}
exports.InvalidOption = InvalidOption;
class InvalidJwtToken extends HttpException {
    constructor(err) {
        super(401, 'Invalid Jwt Token ' + err.message, err);
    }
}
exports.InvalidJwtToken = InvalidJwtToken;
//# sourceMappingURL=HttpException.js.map