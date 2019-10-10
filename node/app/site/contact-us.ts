/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { next_fn, request, response } from '../../mw/request';
import { inject } from '../../ioc/inject';
import { injectable } from '../../ioc/container';
import { is_request_handler } from '../../mw/api';

export interface site_contact_us_msg {
  company?: string;
  email: string;
  msg: string;
  name: string;
  phone?: string;
}

@injectable()
export class app_site_contact_us_svc {
  handle_msg(msg: site_contact_us_msg): Promise<boolean> {
    // todo: process the message here.
    return Promise.resolve(true);
  }
}

export class app_site_contact_us {
  @is_request_handler({
    method: 'PUT',
    path: '/site/contact-us-msg'
  })
  async put(rqs: request, rsp: response, next: next_fn, @inject(app_site_contact_us_svc) svc: app_site_contact_us_svc): Promise<any> {
    rsp.send(await svc.handle_msg(rqs.body));
  }
}