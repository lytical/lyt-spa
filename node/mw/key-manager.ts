/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { container } from '../ioc';

export abstract class key_manager {
  static add(ioc: container) {
    ioc.set(key_manager, new key_manager_imp());
  }
}

class key_manager_imp extends key_manager {
}