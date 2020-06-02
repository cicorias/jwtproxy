"use strict";
/*! *****************************************************************************
Copyright (c) 2020 Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidJwksUrl = exports.InvalidJwtToken = exports.InvalidOption = exports.NoJwtException = exports.HttpException = void 0;
class HttpException extends Error {
    constructor(status, message, baseError) {
        super(message + (baseError === null || baseError === void 0 ? void 0 : baseError.message));
        this.status = status;
        this.message = message + (baseError === null || baseError === void 0 ? void 0 : baseError.message);
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
class InvalidJwksUrl extends HttpException {
    constructor(msg) {
        super(401, 'Invalid JwksUrl ' + msg);
    }
}
exports.InvalidJwksUrl = InvalidJwksUrl;
//# sourceMappingURL=HttpException.js.map