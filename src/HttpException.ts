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

export class HttpException extends Error {
  public status: number;
  public message: string;
  constructor(status: number, message: string, baseError?: Error) {
    super(message + baseError?.message);
    this.status = status;
    this.message = message + baseError?.message;
  }
}

export class NoJwtException extends HttpException {
  constructor() {
    super(401, 'Jwt missing from Request');
  }
}

export class InvalidOption extends HttpException {
  constructor(msg?: string) {
    super(401, 'Invalid option specified: ' + msg);
  }
}

export class InvalidJwtToken extends HttpException {
  constructor(err: Error) {
    super(401, 'Invalid Jwt Token ' + err.message, err);
  }
}

export class InvalidJwksUrl extends HttpException {
  constructor(msg?: string) {
    super(401, 'Invalid JwksUrl ' + msg);
  }
}

export class InvalidAudience extends HttpException {
  constructor(msg?: string) {
    super(403, 'Invalid Audience ' + msg);
  }
}

export class InvalidIssuer extends HttpException {
  constructor(msg?: string) {
    super(403, 'Invalid Issuer ' + msg);
  }
}

export class InvalidAlgorithm extends HttpException {
  constructor(msg?: string) {
    super(403, 'Invalid Algorithm ' + msg);
  }
}

