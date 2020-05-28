/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Request, Response, Router } from 'express';
// var colors = require('colors');

export function get(req: Request, res: Response) {
  // console.log(colors.green('\tin the handler for get'));
  res.status(200).json({ message: 'you made it' });
  // next();
}
export function post(req: Request, res: Response) {
  // console.log(colors.green('\tin the post handler'));
  res.status(200).json({ name: 'you made it' });
  // next();
}
export function put(req: Request, res: Response) {
  // console.log(colors.green('\tin the put handler'));
  res.status(200).json({ name: 'you made it' });
  // next();
}
export function head(req: Request, res: Response) {
  // console.log(colors.green('\tin the head handler'));
  res.status(200); //.json({ name: 'you made it' });
  // next();
}
export function options(req: Request, res: Response) {
  // console.log(colors.green('\tin the options handler'));
  res.status(200).json({ name: 'you made it' });
  // next();
}
export function del(req: Request, res: Response) {
  // console.log(colors.green('\tin the delete handler'));
  res.status(200).json({ name: 'you made it' });
  // next();
}
export function genericHandlers(router: Router, path: string) {
  router.get(path, get);
  router.post(path, post);
  router.put(path, put);
  router.head(path, head);
  router.options(path, options);
  router.delete(path, del);
  return router;
};
