/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as _path from 'path';
import * as _fs from 'fs';
import { request, application, response, next_fn } from './request';
import { get_method_args, container } from '../ioc';
import HTTP_STATUS_CODES from 'http-status-enum';
import { modules } from '../lib/modules';

const request_handler_method: unique symbol = Symbol('lyt-request-handler-method');

export interface request_handler_args {
  path?: (string | RegExp) | (string | RegExp)[];
  method?: string | string[];
}

export function is_request_handler(arg?: request_handler_args) {
  return (cstr: any, method_nm: string, prop: PropertyDescriptor) => {
    console.assert(prop.value.length >= 3, 'method is not a request handler');
    if(prop.value.length >= 3) {
      const metadata = cstr[request_handler_method] || {};
      metadata[method_nm] = arg || {};
      cstr[request_handler_method] = metadata;
    }
  }
}

type __cstor = new (arg?: any) => any;

export async function api_use(app: application, path: string, root?: string): Promise<any> {
  console.assert(path, 'invalid argument root cannot be empty');
  root = _path.normalize(_path.resolve(root ? root : path));
  const set = new Set<__cstor>();
  for(let mod of await modules.get_modules(path)) {
    for(let cstor of Object.getOwnPropertyNames(mod[1])) {
      if(cstor !== '__esModule') {
        let cls = mod[1][cstor];
        let item = cls.prototype;
        while(item) {
          let pd = Object.getOwnPropertyDescriptor(item, request_handler_method);
          if(pd && !set.has(item)) {
            set.add(item);
            let md: { [_: string]: request_handler_args } = pd.value;
            for(let method_nm of Object.getOwnPropertyNames(md)) {
              let arg: request_handler_args = md[method_nm];
              if(arg.path === undefined) {
                arg.path = [mod[0]];
              }
              for(let path of typeof arg.path === 'string' || arg.path instanceof RegExp ? [arg.path!] : arg.path!) {
                if(typeof path === 'string' && path.startsWith(root)) {
                  path = path.substr(root.length).replace(/\\/g, '/');
                  let m = path.match(/([^\.]+)\.js(.*)/);
                  if(m) {
                    path = `${m[1]}${m[2]}`;
                  }
                }
                if(!arg.method) {
                  use(cls, item, method_nm, path, app);
                }
                else {
                  for(let method of typeof arg.method === 'string' ? [arg.method] : arg.method) {
                    use(cls, item, method_nm, path, app, method);
                  }
                }
              }
            }
          }
          item = Object.getPrototypeOf(item);
        }
      }
    }
  }
}

interface handler {
  cstor: (new (arg?: any) => any);
  prototype: any;
  member: string;
  method?: string;
}

const map: Map<string, handler[]> = new Map<string, handler[]>();

function handler(rqs: request, rsp: response, next: next_fn, svc: container, cstor: (new (arg?: any) => any), prototype: any, member: string) {
  let param = get_method_args(svc, prototype, member);
  if(param.length < 3) {
    param = [rqs, rsp, next];
  }
  else {
    param[0] = rqs;
    param[1] = rsp;
    param[2] = next;
  }
  let rs = new cstor(...get_method_args(svc, cstor));
  rs = prototype[member].apply(rs, param);
  if(rs && typeof rs.catch === 'function') {
    rs.catch((err: Error) => rsp.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).end(err));
  }
}

function use(cstor: (new (arg?: any) => any), prototype: any, member: string, path: string | RegExp, app: application, method?: string) {
  if(method === undefined) {
    app.use(path, (rqs, rsp, next) => handler(rqs, rsp, next, app.svc!, cstor, prototype, member));
    return;
  }
  switch(method) {
    case 'GET':
      app.get(path, (rqs, rsp, next) => handler(rqs, rsp, next, app.svc!, cstor, prototype, member));
      return;
    case 'POST':
      app.post(path, (rqs, rsp, next) => handler(rqs, rsp, next, app.svc!, cstor, prototype, member));
      return;
    case 'PUT':
      app.put(path, (rqs, rsp, next) => handler(rqs, rsp, next, app.svc!, cstor, prototype, member));
      return;
    case 'DELETE':
      app.delete(path, (rqs, rsp, next) => handler(rqs, rsp, next, app.svc!, cstor, prototype, member));
      return;
    case 'HEAD':
      app.head(path, (rqs, rsp, next) => handler(rqs, rsp, next, app.svc!, cstor, prototype, member));
      return;
    case 'CONNECT':
      app.connect(path, (rqs, rsp, next) => handler(rqs, rsp, next, app.svc!, cstor, prototype, member));
      return;
    case 'OPTIONS':
      app.options(path, (rqs, rsp, next) => handler(rqs, rsp, next, app.svc!, cstor, prototype, member));
      return;
    case 'TRACE':
      app.trace(path, (rqs, rsp, next) => handler(rqs, rsp, next, app.svc!, cstor, prototype, member));
      return;
    case 'PATCH':
      app.patch(path, (rqs, rsp, next) => handler(rqs, rsp, next, app.svc!, cstor, prototype, member));
      return;
  }
  let id = path.toString();
  let item = map.get(id);
  if(item) {
    item.push({
      cstor,
      prototype,
      member,
      method
    });
  }
  else {
    map.set(id, [
      {
        cstor,
        prototype,
        member,
        method
      }]);
    const svc = app.svc!;
    app.use(path, (rqs, rsp, next) => {
      for(const item of map.get(id)!) {
        if(!item.method || rqs.method === item.method) {
          handler(rqs, rsp, next, svc, item.cstor, item.prototype, item.member);
          return;
        }
      }
      next();
    });
  }
}