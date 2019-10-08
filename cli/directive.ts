/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { DirectiveBinding } from 'vue/types/options';
import { VNode } from 'vue';

const directive_metadata: unique symbol = Symbol('directive-metadata');

export interface directive_binding extends DirectiveBinding {
  [_: string]: any;
}

export interface directive_metadata {
  name?: string;
}

export interface directive {
  bind?(el: HTMLElement, binding: directive_binding, vnode: VNode, oldVnode: VNode): void;
  inserted?(el: HTMLElement, binding: directive_binding, vnode: VNode, oldVnode: VNode): void;
  update?(el: HTMLElement, binding: directive_binding, vnode: VNode, oldVnode: VNode): void;
  componentUpdated?(el: HTMLElement, binding: directive_binding, vnode: VNode, oldVnode: VNode): void;
  unbind?(el: HTMLElement, binding: directive_binding, vnode: VNode, oldVnode: VNode): void;
}

export class directive {
  static async create(id: string, on_prototype?: (prototype: any) => void): Promise<object> {
    const mod = await import(id);
    for(let nm of Object.getOwnPropertyNames(mod)) {
      let cstor = mod[nm];
      let md = directive.get_metadata(cstor);
      if(md) {
        if(typeof on_prototype === 'function') {
          on_prototype(cstor.prototype);
        }
        return new cstor();
      }
    }
    throw new Error('not found');
  }

  static get_metadata(value: any): directive_metadata | undefined {
    if(value) {
      const rt = value[directive_metadata];
      if(rt) {
        return rt;
      }
      return value.prototype ? value.prototype[directive_metadata] : undefined;
    }
    return undefined;
  }
}

export function is_directive(md?: directive_metadata | string) {
  return (cstr: Function) => {
    cstr.prototype[directive_metadata] = typeof md === 'string' ? { name: md } : md || {};
  }
}