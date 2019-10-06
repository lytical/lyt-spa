/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as _express from 'express';
import * as _path from 'path';
import cookieParser = require('cookie-parser');
import { app_config, mw_app, xsrf_token, secured_by, web_sock, api_use } from '../mw';
import { config, fs, cmd_line, json_reviver } from '../lib';
import { container, add_command_line_to_config, add_json_file_to_config } from '../ioc';

export default class spa_init {
  static init(app: mw_app, use_static: boolean = false, api_path: string = 'node', cli_path: string = 'cli') {
    app.once('show-help', () => console.info(`
lyt-spa(TM) by lytical(R)
  usage:
    node api/main --syskey [--cfg-path=...] [--dev]
  where:
    --cfg-path : relative or absolute path to a json file containing the application configuration settings.
    --dev      : run in development mode (this mode is a single instance execution).
                 omitting this option will run in either master or worker cluster mode.
    --syskey  : the system private key`));

    app.once('worker-init', () => {
      app.once('services-add', (svc, deferred) => {
        web_sock.add_sockjs_worker(app, svc);
        deferred.push(spa_init.add_services(svc));
        deferred.push(spa_service.add_service(svc, cli_path));
      });
      app.once('services-rdy', ioc => {
        const cfg = ioc.get<app_config>(config);
        if(!cfg || cfg.dev === undefined) {
          const svc = ioc.get<spa_service>(spa_service)!;
          ioc.set(spa_service, new spa_service_imp(svc.get_components(), svc.get_directives()));
        }
      });
    });
    app.once('master-init', () => {
      app.once('services-add', (svc, deferred) => {
        web_sock.add_sockjs_master(app);
        deferred.push(spa_init.add_services(svc));
      });
    });
    app.once('use-middleware', (express, deferred) => {
      if(use_static) {
        express.use(_express.static(cli_path));
      }
      express.use(cookieParser());
      express.use(xsrf_token());
      let ioc = express.svc!;
      express.use(secured_by(ioc));
      express.use(_express.json({ reviver: ioc.get(json_reviver) }));
      deferred.push(api_use(express, api_path));
    });
  }

  private static async add_services(svc: container): Promise<any> {
    await add_json_file_to_config(cmd_line.get_arg('--cfg-path') || './config.json', svc);
    add_command_line_to_config(svc);
  }
}

export abstract class spa_service {
  abstract get_components(): Promise<string[]>;
  abstract get_directives(): Promise<string[]>;

  static add_service(ioc: container, cli_path: string): Promise<any> {
    const rt = new spa_service_dbg(cli_path);
    ioc.set(spa_service, rt);
    return rt.get_components();
  }
}

class spa_service_imp extends spa_service {
  constructor(private component_list: Promise<string[]>, private directive_list: Promise<string[]>) {
    super();
  }

  get_components(): Promise<string[]> {
    return this.component_list;
  }

  get_directives(): Promise<string[]> {
    return this.directive_list;
  }
}

class spa_service_dbg extends spa_service {
  constructor(private cli_path: string) {
    super();
  }

  async get_components(): Promise<string[]> {
    const rt: string[] = [];
    const modules = await fs.read(`${this.cli_path}/main.js`, 'utf8');
    console.assert(typeof modules === 'string');
    if(typeof modules === 'string') {
      const html = await fs.read(`${this.cli_path}/html.js`, 'utf8');
      console.assert(typeof html === 'string');
      if(typeof html === 'string') {
        let match = html.match(spa_service_dbg.html_pattern);
        if(match) {
          for(let path of match) {
            let m = path.match(spa_service_dbg.html_path_pattern);
            if(m && m.length == 2 && modules.indexOf(`define("${m[1]}"`) !== -1) {
              rt.push(m[1]);
            }
          }
        }
      }
    }
    return rt;
  }

  async get_directives(): Promise<string[]> {
    const rt: string[] = [];
    const modules = await fs.read(`${this.cli_path}/main.js`, 'utf8');
    console.assert(typeof modules === 'string');
    if(typeof modules === 'string') {
      const m = modules.match(/define\("[^"]+",/g);
      if(m) {
        let li = 0;
        const mod = m.map(x => {
          const rs = modules.indexOf(x, li);
          li = rs + x.length;
          return rs;
        });
        for(let i = 0; i < mod.length; ++i) {
          const ni = i + 1;
          const txt = modules.substr(mod[i], ni != mod.length ? mod[ni] - mod[i] : undefined);
          if(txt.indexOf('.is_directive(') !== -1) {
            rt.push(txt.match(/"([^"]+)"/)![1]);
          }
        }
      }
    }
    return rt;
  }

  private static html_pattern = /define\("text![^\.]+\.html"/g;
  private static html_path_pattern = /text!([^\.]+)/;
}