/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import Vue, { ComponentOptions } from 'vue';

const component_metadata: unique symbol = Symbol('component-metadata');
const component_data_metadata: unique symbol = Symbol('component-data-metadata');

export interface component_metadata {
  html: string;
  name?: string;
  route?: string[];
  keep_alive?: true;
}

const component_standard_methods = [
  'activated',
  'beforeCreate',
  'beforeDestroy',
  'beforeMount',
  'beforeUpdate',
  'constructor',
  'created',
  'data',
  'deactivated',
  'destroyed',
  'errorCaptured',
  'mounted',
  'render',
  'renderError',
  'serverPrefetch',
  'staticRenderFns',
  'updated'
];

/**
 * decorates a class to designate a vue component
 * * methods property contains all non standard methods
 * * computed property contains all get property descriptors
 * * watch property contains all set property descriptors
 * @param md
 */
export function is_component(md: component_metadata) {
  return (cstr: Function) => {
    cstr.prototype[component_metadata] = md;
    let has_computed = false;
    let has_methods = false;
    let has_watch = false;
    const computed: { [_: string]: any } = {};
    const methods: { [_: string]: any } = {};
    const watch: { [_: string]: any } = {};
    for(let pt = cstr.prototype; Object.getPrototypeOf(pt); pt = Object.getPrototypeOf(pt)) {
      for(let nm of Object.getOwnPropertyNames(pt).filter(x => component_standard_methods.every(y => y !== x))) {
        let pd = Object.getOwnPropertyDescriptor(pt, nm);
        if(methods[nm] === undefined && pd && typeof pd.value === 'function') {
          has_methods = true;
          methods[nm] = pd.value;
        }
        else if(computed[nm] === undefined && pd && typeof pd.get === 'function') {
          has_computed = true;
          computed[nm] = pd.get;
        }
        else if(watch[nm] === undefined && pd && typeof pd.set === 'function') {
          has_watch = true;
          watch[nm] = pd.set;
        }
      }
    }
    if(has_computed) {
      cstr.prototype.computed = computed;
    }
    if(has_methods) {
      cstr.prototype.methods = methods;
    }
    if(has_watch) {
      cstr.prototype.watch = watch;
    }
  };
};

function get_data_for(target: any): object {
  if(!target) {
    return {};
  }
  let md = Object.getOwnPropertyDescriptor(target, 'data');
  return md && typeof md.value === 'function' ? md.value() : get_data_for(Object.getPrototypeOf(target));
}

export function data(value: any = null) {
  return (target: any, property: string, descriptor?: PropertyDescriptor) => {
    let md = Object.getOwnPropertyDescriptor(target, component_data_metadata);
    if(md) {
      md.value[property] = value;
    }
    else {
      let data: any = get_data_for(Object.getPrototypeOf(target));
      target.data = function() {
        let rt = JSON.parse(JSON.stringify(data));
        if(typeof this.init_data === 'function') {
          this.init_data(rt);
        }
        return rt;
      }
      data[property] = value;
      target[component_data_metadata] = data;
    }
  };
}

export function property(type: any = null) {
  return (target: any, property: string, descriptor?: PropertyDescriptor) => {
    let pt = Object.getOwnPropertyDescriptor(target, 'props');
    if(pt) {
      pt.value[property] = type;
    }
    else {
      let props: any = Object.assign({}, target.props);
      props[property] = type;
      target.props = props;
    }
  };
}

export interface component extends ComponentOptions<Vue>, JQuery.PlainObject {
  can_deactivate?(): boolean | PromiseLike<boolean>;
  init_data?(data: any): void;
}

export class component {
  static async create(id: string, on_prototype?: (prototype: any) => void): Promise<object> {
    const mod = await import(id);
    for(let nm of Object.getOwnPropertyNames(mod)) {
      let cstor = mod[nm];
      let md = component.get_metadata(cstor);
      if(md) {
        if(typeof on_prototype === 'function') {
          on_prototype(cstor.prototype);
        }
        const rt = new cstor();
        if(md.html) {
          rt.template = await import(`text!${md.html}`);
        }
        return rt;
      }
    }
    throw new Error('not found');
  }

  static get_metadata(value: any): component_metadata | undefined {
    if(value) {
      const rt = value[component_metadata];
      if(rt) {
        return rt;
      }
      return value.prototype ? value.prototype[component_metadata] : undefined;
    }
    return undefined;
  }
}