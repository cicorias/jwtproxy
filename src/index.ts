import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (
  request: Request,
  response: Response,
  next: NextFunction
) => {

  const message = "Resource not found";

  response.status(404).send(message);
};


/**
 * append to the Express Response object
 * new properties.
 */
declare namespace Express {
  interface JwtVerify {
      // Add JwtVerify properties in here
  }

  export interface Response {
      jwtverify: JwtVerify
  }
}
