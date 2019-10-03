/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { is_component, component } from '../component';

interface model {
  year: number;
}

@is_component({
  html: 'page/footer.html'
})
export class page_footer implements component {
  data(): model {
    return {
      year: new Date(Date.now()).getUTCFullYear()
    };
  }
}