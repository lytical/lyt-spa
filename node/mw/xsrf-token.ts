/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { RequestHandler } from 'express';
import _uuid = require('uuid');
import HTTP_STATUS_CODES from 'http-status-enum';

export const xsrf_token_cookie_id = 'XSRF-TOKEN';
export const xsrf_token_header_id = 'x-xsrf-token';

export function xsrf_token(): RequestHandler {
  return (rqs, rsp, next) => {
    let cookie = rqs.cookies[xsrf_token_cookie_id];
    if(cookie === undefined) {
      rsp.cookie(xsrf_token_cookie_id, _uuid.v4())
    }
    if(rqs.method !== 'GET' && rqs.method !== 'HEAD') {
      let hdr = rqs.header(xsrf_token_header_id);
      if((hdr || cookie) && hdr !== cookie) {
        rsp.sendStatus(HTTP_STATUS_CODES.BAD_REQUEST);
        return;
      }
    }
    next();
  }
}