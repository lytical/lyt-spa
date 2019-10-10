/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { IncomingMessage, ServerResponse } from 'http';
import { Request, NextFunction, RequestHandler, Response, Application } from 'express';
import { Observable } from 'rxjs';
import HTTP_STATUS_CODES from 'http-status-enum';
import { container } from '../ioc/container';

declare module 'http' {
  interface IncomingMessage {
    is_rest_request: boolean;
  }

  interface ServerResponse {
    send_rx(obs: Observable<any>): Promise<void>;
  }
}

const hdr_accept_json = 'x-accept-json';

Object.defineProperty(IncomingMessage.prototype, 'is_rest_request', {
  get() {
    let rt: string | undefined = this.headers[hdr_accept_json] || this.query.lyt;
    if(rt !== undefined) {
      return rt === 'true';
    }
    rt = this.headers.accept;
    if(rt && rt.split(',').map(x => x.trim().toLowerCase().split(';')[0]).some(x => x === 'application/json' || x === 'text/json' || x === 'application/x-es-module' || x.startsWith('application/module'))) {
      this.headers[hdr_accept_json] = 'true';
      return true;
    }
    this.headers[hdr_accept_json] = 'false';
    return false;
  }
});

Object.defineProperty(IncomingMessage.prototype, 'svc', {
  get() {
    return this.app.svc;
  }
});

Object.defineProperty(ServerResponse.prototype, 'svc', {
  get() {
    return this.app.svc;
  }
});

ServerResponse.prototype.send_rx = function (obs: Observable<any>, rsp_status: number = HTTP_STATUS_CODES.OK, headers: any = {}): Promise<void> {
  return new Promise<void>((res, rej) => {
    headers['Content-Type'] = 'application/json';
    this.writeHead(rsp_status, headers);
    let is_1st = true;
    this.write('[');
    obs.subscribe(
      rec => {
        if(is_1st) {
          is_1st = false;
        }
        else {
          this.write(',');
        }
        this.write(JSON.stringify(rec));
      },
      err => rej(err),
      () => {
        this.write(']');
        this.end(res);
      });
  });
};

export interface application extends Application {
  svc?: container;
}

export interface request extends Request {
  actual_path?: string;
  arg?: string[];
  secured_by?: string;
  seg?: string[];
  svc?: container;
}

export interface response extends Response {
  svc?: container;
}

export interface next_fn extends NextFunction {
  (err?: any): void;
}

export interface request_handler extends RequestHandler {
  (rqs: request, rsp: response, next: next_fn): any;
}