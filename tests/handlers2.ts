/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Request, Response, Router, NextFunction } from 'express';
// var colors = require('colors');


const rv = ['john', 'paul', 'ringo'];

export function get(req: Request, res: Response, next: NextFunction) {
  // console.log(colors.green('\tin the handler for get'));
  //res.status(200);;
  return res.send(rv);
}
export function post(req: Request, res: Response, next: NextFunction) {
  // console.log(colors.green('\tin the post handler'));
  //res.status(200);
  return res.send(rv);
}
export function put(req: Request, res: Response, next: NextFunction) {
  // console.log(colors.green('\tin the put handler'));
  //res.status(200);
  return res.send(rv);
}
export function head(req: Request, res: Response, next: NextFunction) {
  // console.log(colors.green('\tin the head handler'));
  //res.status(200); //.json({ name: 'you made it' });
  return res.send(rv);
}
export function options(req: Request, res: Response, next: NextFunction) {
  // console.log(colors.green('\tin the options handler'));
  //res.status(200);
  return res.send(rv);
}
export function del(req: Request, res: Response, next: NextFunction) {
  // console.log(colors.green('\tin the delete handler'));
  //res.status(200);
  return res.send(rv);
}
export function genericHandlers(router: Router, path: string) {
  router.get(path, get);
  router.post(path, post);
  router.put(path, put);
  router.head(path, head);
  router.options(path, options);
  router.delete(path, del);
  return router;
}
