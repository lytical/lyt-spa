/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { STATUS_CODES } from 'http';

interface http_error extends Error {
  status?: number;
}

export function create_http_error(status: number, message?: string): http_error {
  let rt = <http_error>new Error(message);
  rt.status = status;
  rt.message = message || STATUS_CODES[status] || `http-error:${status}`;
  return rt;
}