/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { container } from './container';

const ioc_argument_inject: unique symbol = Symbol('ioc-argument-inject');
const cstor_nm = '__cstor';

interface method_metadata {
  [_: string]: any[]
}

export function get_method_args(ioc: container, cstr: any, method_nm: string = cstor_nm): any[] {
  while(cstr) {
    const metadata: method_metadata = cstr[ioc_argument_inject];
    if(metadata !== undefined && metadata[method_nm] !== undefined) {
      return metadata[method_nm].map(x => x ? ioc.get(x) : undefined);
    }
    cstr = cstr.prototype;
  }
  return [];
}

export function inject(type: Function | (new (..._: any) => any)) {
  return (cstr: any, method_nm: string, ordinal: number) => {
    const metadata: method_metadata = cstr[ioc_argument_inject] || {};
    if(!method_nm) {
      method_nm = cstor_nm;
    }
    if(metadata[method_nm] === undefined) {
      const param: any[] = [];
      param[ordinal] = type;
      metadata[method_nm] = param;
      cstr[ioc_argument_inject] = metadata;
    }
    else {
      metadata[method_nm][ordinal] = type;
    }
  }
}