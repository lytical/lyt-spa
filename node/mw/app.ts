/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as _cluster from 'cluster';
import * as _events from 'events';
import * as _express from 'express';
import * as _http from 'http';
import * as _https from 'https';
import * as _net from 'net';
import * as _os from 'os';
import * as _url from 'url';
import HTTP_STATUS_CODES from 'http-status-enum';
import { container } from '../ioc/container';
import { text_color, text } from '../lib/text';
import { logger } from '../lib/logger';
import { file_invalid_path_pattern } from '../lib/fs';
import { json_replacer, json_reviver, json } from '../lib/json';
import { crypto } from '../lib/crypto';
import { config } from '../lib/config';
import { create_http_error } from './error';
import { message } from './message';
import { web_sock } from './web-sock';
import { application } from './request';
import { repos_info } from '../data/repos';

export const topic_name_worker_started = 'worker:started';
export const path_invalid_path_pattern = /(?:^\s*\w+:|^\s*\\\\|\.\.)/;

export interface app_config extends config {
  db: string;
  dev?: null;
  'host-url': string;
  'primary-repos'?: repos_info;
  'syskey'?: string;
  'host-pfx'?: string;
  'host-pfx-pwd'?: string;
}

export class server_options implements _https.ServerOptions {
}

export class mw_app extends _events.EventEmitter {
  on(event: 'master-message', listener: (msg: any, ioc: container) => void): this;
  on(event: 'worker-disconnect', listener: (id: number) => void): this;
  on(event: 'worker-error', listener: (id: number, err: Error) => void): this;
  on(event: 'worker-exit', listener: (id: number, rs: number, signal: string) => void): this;
  on(event: 'worker-listening', listener: (id: number, addr: _cluster.Address) => void): this;
  on(event: 'worker-message', listener: (msg: any, id: number) => void): this;
  on(event: 'worker-online', listener: (id: number) => void): this;
  on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  once(event: 'master-init', listener: (ioc: container) => void): this;
  once(event: 'master-message', listener: (msg: any, ioc: container) => void): this;
  once(event: 'ready', listener: () => void): this;
  once(event: 'services-add', listener: (ioc: container, deferred: Promise<any>[]) => void): this;
  once(event: 'services-rdy', listener: (ioc: container) => void): this;
  once(event: 'show-help', listener: () => void): this;
  once(event: 'use-middleware', listener: (app: application, deferred: Promise<any>[]) => void): this;
  once(event: 'worker-disconnect', listener: (id: number) => void): this;
  once(event: 'worker-error', listener: (id: number, err: Error) => void): this;
  once(event: 'worker-exit', listener: (id: number, rs: number, signal: string) => void): this;
  once(event: 'worker-init', listener: (ioc: container) => void): this;
  once(event: 'worker-listening', listener: (id: number, addr: _cluster.Address) => void): this;
  once(event: 'worker-message', listener: (msg: any, id: number) => void): this;
  once(event: 'worker-online', listener: (id: number) => void): this;
  once(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.once(event, listener);
  }

  async run(ioc?: container): Promise<void> {
    if(!ioc) {
      ioc = new container();
      ioc.load_injectables(`${__dirname}/..`);
    }
    if(!ioc.get<logger>(logger)) {
      ioc.set(logger, logger.create((msg, level) => {
        switch(level) {
          case 'debug':
            console.debug(text.debug(msg.toString()));
            break;
          case 'error':
            console.error(text.error(msg.toString()));
            break;
          case 'info':
            console.info(msg);
            break;
          case 'trace':
            console.trace(text.trace(msg.toString()));
            break;
          case 'warn':
            console.warn(text.warn(msg.toString()));
            break;
        }
      }));
    }
    let cl = process.argv;
    if(cl.some(x => x === '--help' || x === '--h' || x === '--?' || x === '-h' || x === '-?')) {
      mw_app.show_intro();
      if(this.listeners('show-help').length === 0) {
        mw_app.show_help();
      }
      else {
        this.emit('show-help');
      }
      return;
    }
    if(cl.indexOf('--dev') !== -1) {
      mw_app.show_intro();
      this.emit('master-init', ioc);
      this.launch_worker(ioc);
    }
    else if(_cluster.isMaster) {
      mw_app.show_intro();
      await this.launch_master(ioc);
    }
    else {
      await this.launch_worker(ioc);
    }
  }

  private fork(): _cluster.Worker {
    let wrk = _cluster.fork();
    let id = wrk.id;
    wrk
      .on('disconnect', () => this.emit('worker-disconnect', id))
      .on('error', err => this.emit('worker-error', id, err))
      .on('exit', (rs, signal) => this.worker_exit(id, rs, signal))
      .on('listening', addr => this.emit('worker-listening', id, addr))
      .on('message', msg => this.emit('worker-message', id, msg))
      .on('online', () => this.emit('worker-online', id));
    return wrk;
  }

  private get http_header(): _express.RequestHandler {
    return (rqs, rsp, next) => {
      rsp.set('X-Powered-By', 'powered by lytical® enterprise solutions, backed by express.');
      next();
    }
  }

  private get http_validate(): _express.RequestHandler {
    return (rqs, rsp, next) => {
      if(file_invalid_path_pattern.test(rqs.method) || path_invalid_path_pattern.test(rqs.path)) {
        next(create_http_error(HTTP_STATUS_CODES.BAD_REQUEST));
      }
      else {
        next();
      }
    };
  }

  private async launch_master(ioc: container) {
    for(let i = 0, max = _os.cpus().length; i < max; ++i) {
      this.fork();
    }
    ioc.set(message, message.for_master(this, ioc));
    this.emit('master-init', ioc);
    await this.register_services(ioc);
  }

  private async launch_worker(ioc: container) {
    const msg = message.for_worker(this, ioc);
    ioc.set(message, msg);
    this.emit('worker-init', ioc);
    await this.register_services(ioc);
    let cfg = ioc.get<app_config>(config)!;
    let url = _url.parse(cfg['host-url']);
    let port: string | number;
    let svr: _net.Server;
    let app = _express();
    Object.defineProperty(app, 'svc', { get: () => ioc });
    if(url.protocol === 'https:') {
      let opt: _https.ServerOptions = {
        pfx: cfg['host-pfx'],
        passphrase: cfg['host-pfx-pwd']
      };
      if(!opt.pfx || !opt.passphrase) {
        throw new Error('invalid-config: "host-pfx" and "host-pfx-pwd" are required for HTTPS protocols.');
      }
      let syskey = cfg.syskey;
      if(!syskey) {
        throw new Error('invalid-config: "syskey" is required.');
      }
      let crypt = ioc.get<crypto>(crypto)!;
      console.assert(crypt !== null && crypt !== undefined);
      opt.passphrase = crypt.decrypt(opt.passphrase, syskey);
      svr = ioc.get(_net.Server) || _https.createServer(opt);
      port = url.port || 443;
    }
    else {
      svr = ioc.get(_net.Server) || new _http.Server(app);
      port = url.port || 80;
    }
    ioc.set(_net.Server, svr);
    let ws = ioc.get<web_sock>(web_sock);
    if(ws) {
      ws.init(svr);
    }
    app.use(this.http_header);
    app.use(this.http_validate);
    let deferred: Promise<any>[] = [];
    this.emit('use-middleware', app, deferred);
    await Promise.all(deferred);
    svr.listen(port);
    this.emit('ready');
    if(_cluster.isWorker) {
      msg.send(topic_name_worker_started, _cluster.worker.id);
      ioc.get<logger>(logger)!.info(`started middleware server ${url.href}(${_cluster.worker.id})`);
    }
    else {
      ioc.get<logger>(logger)!.info(`started middleware server ${url.href} on port ${port}`);
    }
  }

  private async register_services(ioc: container) {
    ioc.set(config, {});
    ioc.set(json_reviver, json.reviver);
    ioc.set(json_replacer, json.replacer);
    ioc.set(crypto, crypto);
    let deferred: Promise<any>[] = [];
    this.emit('services-add', ioc, deferred);
    await Promise.all(deferred);
    this.emit('services-rdy', ioc);
  }

  private static show_help() {
    console.info(`
usage:
  node main [--dev]
where:
  --dev : run in development mode (this mode is a single instance execution).
          omitting this option will run in either master or worker cluster mode.`);
  }

  private static show_intro() {
    console.info(`${text_color.fg_green}© 2019, lytical, inc. all rights are reserved.
powered by lytical® enterprise solutions. https://www.lytical.com${text_color.reset}`);
  }

  private worker_exit(from: number, pid: number, signal: string): void {
    console.info(`${from}-exit: [${pid}] ${signal}`);
    this.emit('worker-exit', from, pid, signal);
    this.fork();
  }
}