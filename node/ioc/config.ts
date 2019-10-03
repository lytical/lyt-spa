/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as _path from 'path';
import { cmd_line, config, fs, json_reviver, logger } from '../lib';
import { container } from './container';

export function add_command_line_to_config(ioc: container) {
  var cfg = ioc.get(config);
  if(!cfg) {
    ioc.get<logger>(logger)!.warn(`lyt: won't add command line to config because it does not exist in the ioc container.`);
    return;
  }
  Object.assign(cfg, cmd_line.get_args());
}

export function add_environment_to_config(ioc: container) {
  var cfg = ioc.get(config);
  if(!cfg) {
    ioc.get<logger>(logger)!.warn(`lyt: won't add environment to config because it does not exist in the ioc container.`);
    return;
  }
  Object.assign(cfg, process.env);
}

export async function add_json_file_to_config(path: string, ioc: container) {
  var cfg = ioc.get(config);
  if(!cfg) {
    ioc.get<logger>(logger)!.warn(`lyt: won't add json file (${path}) to config because it does not exist in the ioc container.`);
    return;
  }
  path = _path.resolve(path);
  let retry = 3;
  while(true) {
    try {
      let data = await fs.read(path, 'utf8');
      Object.assign(cfg, JSON.parse(typeof data === 'string' ? data : data.toString('utf8'), ioc.get(json_reviver)));
      cfg.config_path = path;
      break;
    }
    catch(err) {
      if(--retry < 0) {
        throw err;
      }
    }
  }
}