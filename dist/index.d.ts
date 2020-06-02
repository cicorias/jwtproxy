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
import { RequestHandler } from 'express';
import { Algorithm } from 'jsonwebtoken';
/**
 * this allows adding to the Express.Request object.
 */
declare global {
    namespace Express {
        interface Request {
            jwtToken: any;
        }
    }
}
declare function jwtProxy(proxyOptions?: JwtProxyOptions): RequestHandler;
export default jwtProxy;
/** Options for THIS middlware */
export interface JwtProxyOptions {
    disable?: boolean | undefined;
    secretOrKey?: string;
    audience?: string;
    issuer?: string;
    jwksUrl?: string;
    algorithms?: Algorithm[];
    excluded?: string[];
}
