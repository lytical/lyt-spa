/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as _cluster from 'cluster';
import { EventEmitter } from 'events';
import { Observable, Subject } from 'rxjs';
import { container } from '../ioc/container';
import { topic_name_worker_started } from './app';

type payload = [string, any];
type subscription = [RegExp, Subject<payload>];

export abstract class message {
  constructor(app: EventEmitter, ioc: container, event_nm: string) {
    app.on(event_nm, (msg: payload) => {
      if(Array.isArray(msg) && msg.length === 2) {
        this.sub.forEach(sub => {
          if(sub[0].test(msg[0])) {
            sub[1].next(msg);
          }
        });
      }
    });
  }

  abstract send(topic: string, message?: any): void;
  abstract send_to(id: number, topic: string, message?: any): void;

  topic<_t_>(name: string | RegExp): Observable<[string, _t_]> {
    var key = name.toString();
    var sub = this.sub.get(key);
    if(!sub) {
      sub = [
        typeof name === 'string' ? new RegExp(`^${name}$`) : name,
        new Subject<payload>()
      ];
      this.sub.set(key, sub);
    }
    return sub[1];
  }

  static for_master(app: EventEmitter, ioc: container): message {
    return new master_messages(app, ioc);
  }

  static for_worker(app: EventEmitter, ioc: container): message {
    return _cluster.isWorker && process.send ?
      new worker_messages(app, ioc) :
      new loopback_messages(app, ioc);
  }

  protected sub = new Map<string, subscription>();
}

class master_messages extends message {
  constructor(app: EventEmitter, ioc: container) {
    super(app, ioc, 'worker-message');
    app.on('worker-message', (msg: payload) => {
      if(Array.isArray(msg) && msg.length === 2) {
        switch(msg[0]) {
          case topic_name_worker_started:
            break;
          default:
            for(const id in _cluster.workers) {
              let wkr = _cluster.workers[id];
              if(wkr) {
                wkr.send(msg);
              }
            }
        }
      }
    });
  }

  send_to(id: number, topic: string, message?: any): void {
    let wkr = _cluster.workers[id];
    if(wkr) {
      wkr.send([topic, message]);
    }
  }

  send(topic: string, message?: any): void {
    for(const id in _cluster.workers) {
      let wkr = _cluster.workers[id];
      if(wkr) {
        wkr.send([topic, message]);
      }
    }
  }
}

class worker_messages extends message {
  constructor(app: EventEmitter, ioc: container) {
    super(app, ioc, 'master-message');
    process.on('message', msg => app.emit('master-message', msg, ioc));
  }

  send(topic: string, message?: any): void {
    process.send!([topic, message]);
  }

  send_to(id: number, topic: string, message?: any): void {
    console.assert(false, 'worker-not-supported');
  }
}

class loopback_messages extends worker_messages {
  send(topic: string, message?: any): void {
    process.emit('message', [topic, message], undefined);
  }
}