﻿/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { get_method_args } from './inject';
import { modules } from '../lib/modules';

const ioc_argument_injectabe: unique symbol = Symbol('ioc-argument-injectable');

export function injectable(is_singleton: boolean = false, imp_type?: (new (..._: any) => any)) {
  return (cstr: Function) => {
    cstr.prototype[ioc_argument_injectabe] = is_singleton;
  }
}

export class container {
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

  public async load_injectables(path: string = 'node'): Promise<any> {
    for(let func of await modules.find_module_functions(path, x => Object.getOwnPropertyDescriptor(x.prototype, ioc_argument_injectabe) !== undefined)) {
      console.debug({ injectable: func });
    }
  }

  set(type: Function, arg: any): void;
  set(type: new (...arg: any) => any, arg: any): void {
    this.map.set(type, arg);
  }

  private map: Map<new (...arg: any) => any, any> = new Map<new (...arg: any) => any, any>();
}