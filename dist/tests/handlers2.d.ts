import { Request, Response, Router, NextFunction } from 'express';
export declare function get(req: Request, res: Response, next: NextFunction): Response<any>;
export declare function post(req: Request, res: Response, next: NextFunction): Response<any>;
export declare function put(req: Request, res: Response, next: NextFunction): Response<any>;
export declare function head(req: Request, res: Response, next: NextFunction): Response<any>;
export declare function options(req: Request, res: Response, next: NextFunction): Response<any>;
export declare function del(req: Request, res: Response, next: NextFunction): Response<any>;
export declare function genericHandlers(router: Router, path: string): Router;
