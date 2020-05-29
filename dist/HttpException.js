"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HttpException extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
exports.HttpException = HttpException;
class NoJwtException extends HttpException {
    constructor() {
        super(401, 'Unauthorized');
    }
}
exports.NoJwtException = NoJwtException;
//# sourceMappingURL=HttpException.js.map