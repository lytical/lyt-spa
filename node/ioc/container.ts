/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { get_method_args } from './inject';
import { modules } from '../lib/modules';

const ioc_argument_injectabe: unique symbol = Symbol('ioc-argument-injectable');

export function injectable(arg?: any) {
  return (cstr: Function) => {
    cstr.prototype[ioc_argument_injectabe] = arg || cstr;
  }
}

export class container {
  get<_t_ = any>(type: Function): _t_ | undefined;
  get(type: new (..._: any) => any): any | undefined {
    if(type === container) {
      return <any>this;
    }
    if(this.map.has(type)) {
      let arg = this.map.get(type);
      if(typeof arg !== 'function') {
        return arg;
      }
      if(!/^class\s/.test(Function.prototype.toString.call(arg))) {
        let func: (ioc: container) => object | [object] = arg;
        let rt = func.call(undefined, this);
        if(Array.isArray(rt) && rt.length) {
          this.map.set(type, rt[0]);
        }
        return rt;
      }
      // it's a class. instantiate and return
      return new arg(...get_method_args(this, arg));
    }
    return undefined;
  }

  public async load_injectables(path: string = 'node'): Promise<any> {
    for(let item of await modules.find_module_functions(path, x => Object.getOwnPropertyDescriptor(x.prototype, ioc_argument_injectabe) !== undefined)) {
      const func = item[1];
      this.set(func, func.prototype[ioc_argument_injectabe]);
    }
  }

  set(type: Function, arg: any): void;
  set(type: new (...arg: any) => any, arg: any): void {
    this.map.set(type, arg);
  }

  private map: Map<new (...arg: any) => any, any> = new Map<new (...arg: any) => any, any>();
}