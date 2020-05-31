export declare class HttpException extends Error {
    status: number;
    message: string;
    constructor(status: number, message: string, baseError?: Error);
}
export declare class NoJwtException extends HttpException {
    constructor();
}
export declare class InvalidOption extends HttpException {
    constructor(msg?: string);
}
export declare class InvalidJwtToken extends HttpException {
    constructor(err: Error);
}
export declare class InvalidJwksUrl extends HttpException {
    constructor(msg?: string);
}
