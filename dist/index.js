"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
exports.notFoundHandler = (request, response, next) => {
    const message = "Resource not found";
    response.status(404).send(message);
};
//# sourceMappingURL=index.js.map