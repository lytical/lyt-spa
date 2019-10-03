/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { get_method_args } from './inject';

export class container {
  set(type: Function, arg: any): void;
  set(type: new (...arg: any) => any, arg: any): void {
    this.map.set(type, arg);
  }

  get<_t_ = any>(type: Function): _t_ | undefined;
  get<_t_ = any>(type: new (..._: any) => any): _t_ | undefined {
    if(type === container) {
      return <any>this;
    }
    if(this.map.has(type)) {
      let arg = this.map.get(type);
      if(typeof arg !== 'function') {
        return arg;
      }
      if(!/^class\s/.test(Function.prototype.toString.call(arg))) {
        return arg;
      }
      // it's a class. instantiate and return
      return new arg(...get_method_args(this, arg));
    }
    return undefined;
  }

  private map: Map<new (...arg: any) => any, any> = new Map<new (...arg: any) => any, any>();
}