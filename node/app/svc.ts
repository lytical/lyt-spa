/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { container, inject } from '../ioc';
import { app_config, mw_app, message, topic_name_worker_started } from '../mw';
import { repos } from '../data/repos';
import { crypto, config, logger } from '../lib';

const topic_name = 'primary-repos:updated';
export const not_configured_error = 'not-configured';

export interface status_message {
  syskey?: string;
}

export abstract class app_service {
  abstract get_primary_repos(syskey?: string): Promise<repos>;

  static init(app: mw_app) {
    app.once('master-init', ioc => {
      app.once('services-rdy', () => {
        const subject = ioc.get<message>(message);
        if(subject) {
          let syskey: string | undefined;
          subject.topic<status_message>(topic_name).subscribe(msg => {
            syskey = msg[1].syskey;
          });
          subject.topic<number>(topic_name_worker_started).subscribe(msg => {
            if(syskey) {
              subject.send_to(msg[1], topic_name, <status_message>{ syskey });
            }
          });
        }
      });
    });
    app.once('worker-init', ioc => {
      app.once('services-add', (ioc, deferred) => {
        ioc.set(app_service, app_service_imp);
      });
      app.once('services-rdy', () => {
        const subject = ioc.get<message>(message);
        if(subject) {
          subject.topic<status_message>(topic_name).subscribe(msg => {
            if(msg[1].syskey) {
              let svc = ioc.get<app_service>(app_service);
              if(svc) {
                svc.get_primary_repos(msg[1].syskey!)
                  .catch(err => ioc.get<logger>(logger)!.error({ primary_repos_error: [msg[1], err] }));
              }
            }
          });
        }
      });
    });
  }
}

class app_service_imp extends app_service {
  constructor(@inject(container) private ioc: container) {
    super();
  }

  async get_primary_repos(syskey?: string): Promise<repos> {
    let prim_repos = this.ioc.get<repos>(repos);
    if(prim_repos) {
      return prim_repos;
    }
    let cfg = this.ioc.get<app_config>(config);
    if(cfg) {
      const repo_info = cfg['primary-repos'];
      if(repo_info) {
        prim_repos = await repos.create_repos(repo_info.type, this.ioc);
        prim_repos = await prim_repos.connect(new crypto().decrypt(repo_info['conn-str'], syskey || cfg.syskey!));
        await prim_repos.list_dbs();
        this.ioc.set(repos, prim_repos);
        if(cfg.syskey !== syskey) {
          cfg.syskey = syskey;
        }
        return prim_repos;
      }
    }
    throw new Error(not_configured_error);
  }
}