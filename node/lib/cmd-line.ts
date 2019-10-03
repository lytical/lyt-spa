/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { plain_object } from './plain-object';

export class cmd_line {
  static get_args(): plain_object {
    let rt: plain_object = {
      exec_path: process.argv[0],
      main_path: process.argv[1]
    };
    const field = /([^=]+)(=.*)?/;
    for(const i of process.argv.slice(2)) {
      let m = field.exec(i);
      if(m && m.length === 3) {
        rt[m[1].replace(/^--/, '')] = m[2] === undefined ? null : m[2].substr(1);
      }
    }
    return rt;
  }

  static get_arg(key: string, map?: string[]): string | null | undefined {
    let field = `${key}=`;
    let item = (map || process.argv).find(i => i === key || i.startsWith(field));
    if(item === undefined) {
      return undefined;
    }
    return item === key ? null : item.substr(field.length);
  }
}