import { VerifyOptions } from "jsonwebtoken";
import { JwtProxyOptions, fff } from "index";
export declare function getVerifyOptions(token: fff, options?: JwtProxyOptions): Promise<VerifyOptions>;
