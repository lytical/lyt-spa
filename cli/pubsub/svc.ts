/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { Observable, Subject } from 'rxjs';

interface subscriber<_t_ = any> {
  topic: RegExp;
  subject: Subject<[string, _t_]>;
}

export const pubsub_topic_id_sock_closed = 'sock:closed';
export const pubsub_topic_id_sock_opened = 'sock:opened';
export const pubsub_topic_id_sock_recv = (id: any) => `sock:recv:${id}`;

export default abstract class pubsub_service {
  publish(topic: string, msg?: any, async?: false) {
    const do_pub = () => {
      this.sub.forEach((sub) => {
        if(sub.topic.test(topic)) {
          sub.subject.next([topic, msg]);
        }
      });
    }
    if(async === false) {
      do_pub();
    }
    else {
      setTimeout(do_pub, 0);
    }
  }

  get_sock_recv_topic<_t_ = any>(id: string): Observable<[string, _t_]> {
    return this.get_topic(pubsub_topic_id_sock_recv(id));
  }

  get_topic<_t_ = any>(topic: string | RegExp): Observable<[string, _t_]> {
    var key = topic.toString();
    if(this.sub.has(key)) {
      return this.sub.get(key)!.subject;
    }
    var sub = <subscriber>{};
    sub.topic = typeof topic === 'string' ? new RegExp(`^${topic}$`) : topic;
    sub.subject = new Subject<[string, _t_]>();
    this.sub.set(key, sub);
    return sub.subject;
  }

  abstract client_id?: string;
  private sub: Map<string, subscriber> = new Map<any, subscriber>();
}