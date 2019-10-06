/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as _express from 'express';
import * as _http from 'http';
import * as _net from 'net';
import * as _sockjs from 'sockjs';
import * as _uuid from 'uuid';
import { container, inject } from '../ioc';
import { message } from './message';
import { mw_app } from './app';
import { is_request_handler } from './api';
import { request, response, next_fn } from './request';
import HTTP_STATUS_CODES from 'http-status-enum';

export interface sock_broadcast_message {
  data: any;
  topic: string;
}

export interface sock_publish_message extends sock_broadcast_message {
  to: string;
}

const sock_broadcast_topic = 'sock:broadcast';
const sock_publish_topic = 'sock:publish';

export class web_sock {
  constructor(private msg: message) { }

  static add_sockjs_master(app: mw_app) {
    app.on('worker-message', (id, msg) => {
    });
  }

  static add_sockjs_worker(app: mw_app, ioc: container) {
    let svc = ioc.get<message>(message);
    if(svc) {
      let sock = new web_sock(svc);
      ioc.set(web_sock, sock);
      svc.topic<sock_publish_message>(sock_publish_topic).subscribe(
        msg => {
          let conn = sock.conn.get(msg[1].to);
          if(conn) {
            conn.write(JSON.stringify([msg[1].topic, msg[1].data]), 'utf8');
          }
        }
      );
      svc.topic<sock_broadcast_message>(sock_broadcast_topic).subscribe(
        msg => {
          let payload = JSON.stringify([msg[1].topic, msg[1].data]);
          for(const conn of sock.conn) {
            conn[1].write(payload, 'utf8');
          }
        }
      );
    }
  }

  init(svr: _net.Server) {
    let sock = _sockjs.createServer({ prefix: '/sock' });
    sock.on('connection', conn => {
      let id = _uuid.v4();
      this.conn.set(id, conn);
      conn.on('close', () => this.conn.delete(id));
      conn.write(JSON.stringify(['session', id]), 'utf8');
    });
    sock.installHandlers(<_http.Server>svr);
  }

  send(topic: string, msg: any) {
    this.msg.send(sock_broadcast_topic, <sock_broadcast_message>{
      data: msg,
      topic: topic
    })
  }

  send_to(to: string, topic: string, msg: any) {
    this.msg.send(sock_publish_topic, <sock_publish_message>{
      to: to,
      data: msg,
      topic: topic
    });
  }

  private conn: Map<string, _sockjs.Connection> = new Map<string, _sockjs.Connection>();
}

export class web_sock_cli {
  @is_request_handler({
    method: 'POST',
    path: '/pubsub/send-to/:topic/:id'
  })
  send_to(rqs: request, rsp: response, next: next_fn, @inject(web_sock) ws: web_sock) {
    ws.send_to(rqs.params.id, rqs.params.topic, rqs.body);
    rsp.status(HTTP_STATUS_CODES.NO_CONTENT).end();
  }

  @is_request_handler({
    method: 'POST',
    path: '/pubsub/send/:topic'
  })
  send(rqs: request, rsp: response, next: next_fn, @inject(web_sock) ws: web_sock) {
    ws.send(rqs.params.topic, rqs.body);
    rsp.status(HTTP_STATUS_CODES.NO_CONTENT).end();
  }
}