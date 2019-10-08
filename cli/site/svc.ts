/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { Observable } from "rxjs";
import { util_http } from "../util/http";

export interface site_contact_us_msg {
  company?: string;
  email: string;
  msg: string;
  name: string;
  phone?: string;
}

export class site_svc {
  get blank_contact_us_msg(): site_contact_us_msg {
    return {
      company: undefined,
      email: '',
      msg: '',
      name: '',
      phone: undefined
    };
  }

  send_msg(msg: site_contact_us_msg): Observable<any> {
    return util_http.put<any>('/site/contact-us-msg', msg);
  }
}

export default new site_svc();