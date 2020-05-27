export class HttpException extends Error {
  public status: number;
  public message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export class NoJwtException extends HttpException {
  constructor() {
    super(401, 'Unauthorized');
  }
}

//export default HttpException;
