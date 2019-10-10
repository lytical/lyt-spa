/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { next_fn, request, response } from '../mw/request';
import { is_request_handler } from '../mw/api';
import { spa_service } from '../spa';
import { inject } from '../ioc/inject';

export class app_settings {
  @is_request_handler({ method: 'GET' })
  async get(_rqs: request, rsp: response, next: next_fn, @inject(spa_service) svc: spa_service): Promise<any> {
    rsp
      .send({
        component: await svc.get_components(),
        directive: await svc.get_directives()
      })
      .end();
  }
}