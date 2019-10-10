/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { URL } from 'url';
import { db } from './db';
import { file_invalid_path_pattern } from '../lib/fs';
import { container } from '../ioc/container';
import { get_method_args } from '../ioc/inject';

export interface repos {
  close(force?: boolean): Promise<any>;
  connect(url: URL | string): Promise<repos>;
  drop_db(id: string): Promise<any>;
  get_db(id?: string): Promise<db>;
  list_dbs(): Promise<any>;
}

const repos_cache: { [_: string]: new (..._: any) => any } = {};

export class repos {
  static async create_repos(type: string, ioc: container): Promise<repos> {
    let rt = repos_cache[type];
    if(rt !== undefined) {
      return new rt(get_method_args(ioc, rt));
    }
    if(file_invalid_path_pattern.test(type)) {
      throw Error('invalid-argument');
    }
    const mod = await import(`./${type}`);
    if(!mod || !mod.default) {
      throw Error('not-found');
    }
    repos_cache[type] = mod.default;
    return new mod.default(get_method_args(ioc, mod.default));
  }
}

export interface repos_info {
  'conn-str': string;
  type: 'mongodb' | 'sql' | 'odbc' | 'oracle' | 'postgres' | 'excel' | 'csv' | 'websvc' | string;
}