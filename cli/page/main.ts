/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { is_component, component, data } from '../component';
import app_svc from '../app/svc';

@is_component({
  html: 'page/main.html'
})
export class page_main implements component {
  @data(app_svc.keep_alive) protected keep_alive?: string[];
}