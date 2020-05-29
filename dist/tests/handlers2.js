/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericHandlers = exports.del = exports.options = exports.head = exports.put = exports.post = exports.get = void 0;
// var colors = require('colors');
const rv = ['john', 'paul', 'ringo'];
function get(req, res, next) {
    // console.log(colors.green('\tin the handler for get'));
    //res.status(200);;
    return res.send(rv);
}
exports.get = get;
function post(req, res, next) {
    // console.log(colors.green('\tin the post handler'));
    //res.status(200);
    return res.send(rv);
}
exports.post = post;
function put(req, res, next) {
    // console.log(colors.green('\tin the put handler'));
    //res.status(200);
    return res.send(rv);
}
exports.put = put;
function head(req, res, next) {
    // console.log(colors.green('\tin the head handler'));
    //res.status(200); //.json({ name: 'you made it' });
    return res.send(rv);
}
exports.head = head;
function options(req, res, next) {
    // console.log(colors.green('\tin the options handler'));
    //res.status(200);
    return res.send(rv);
}
exports.options = options;
function del(req, res, next) {
    // console.log(colors.green('\tin the delete handler'));
    //res.status(200);
    return res.send(rv);
}
exports.del = del;
function genericHandlers(router, path) {
    router.get(path, get);
    router.post(path, post);
    router.put(path, put);
    router.head(path, head);
    router.options(path, options);
    router.delete(path, del);
    return router;
}
exports.genericHandlers = genericHandlers;
;
//# sourceMappingURL=handlers2.js.map