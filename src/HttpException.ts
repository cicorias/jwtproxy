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

