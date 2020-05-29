export declare class HttpException extends Error {
    status: number;
    message: string;
    constructor(status: number, message: string);
}
export declare class NoJwtException extends HttpException {
    constructor();
}
