/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { plain_object } from '../lib/plain-object';
import { Observable } from 'rxjs';

export interface db {
  exec<_t_ = any>(cmd: plain_object | string): Observable<_t_>;
}