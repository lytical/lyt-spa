/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { fs } from './fs';
import * as _path from 'path';

type __cstor = new (arg?: any) => any;

export class modules {
  static find_module_functions(path: string, predicate: ((item: any, path: string) => boolean)): Promise<[string, any][]> {
    const set = new Set<__cstor>();
    return modules.find_module_items(path, (item, path) => {
      if(item.prototype === undefined || set.has(item)) {
        return false;
      }
      set.add(item);
      return predicate(item, path);
    });
  }

  static async find_module_items(path: string, predicate: ((item: any, path: string) => boolean)): Promise<[string, any][]> {
    const rt: [string, any][] = [];
    for(let mod of await modules.get_modules(path)) {
      for(let cstor of Object.getOwnPropertyNames(mod[1])) {
        if(cstor !== '__esModule') {
          let item = mod[1][cstor];
          let path = mod[0];
          if(predicate(item, path)) {
            rt.push([path, item]);
          }
        }
      }
    }
    return rt;
  }

  static async get_modules(path: string): Promise<[string, any][]> {
    if(!modules.modules) {
      modules.modules = new Map<string, [string, any][]>();
      let rt = await modules.load_modules(path);
      modules.modules.set(path, rt);
      return rt;
    }
    let rt = modules.modules.get(path);
    if(rt) {
      return rt;
    }
    rt = await modules.load_modules(path);
    modules.modules.set(path, rt);
    return rt;
  }

  private static async load_modules(path: string): Promise<[string, any][]> {
    let pm: [string, Promise<any>][] = [];
    for(let file of await fs.find_files(path, /\.js$/)) {
      pm.push([file, import(file)]);
    }
    let mods = await Promise.all(pm.map(x => x[1]));
    const rt: [string, any][] = [];
    for(let i = mods.length - 1; i >= 0; --i) {
      let mod = mods[i];
      if(mod && mod.__esModule) {
        rt.push([pm[i][0], mod]);
      }
    }
    return rt;
  }

  private static modules: Map<string, [string, any][]>;
}