/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { Observable } from 'rxjs';
import { util_http } from '../util/http';
import { Route } from 'vue-router';
import pubsub from 'pubsub';

const pubsub_router_topic = '/app/router/';
const pubsub_router_after_topic_name = `${pubsub_router_topic}after`;
const pubsub_router_before_topic_name = `${pubsub_router_topic}before`;
const pubsub_router_resolve_topic_name = `${pubsub_router_topic}resolve`;
const pubsub_router_go_topic_name = `${pubsub_router_topic}go`;
const pubsub_router_push_topic_name = `${pubsub_router_topic}push`;
const pubsub_router_replace_topic_name = `${pubsub_router_topic}replace`;

export interface settings {
  component: string[];
  directive: string[];
  user: string;
}

export interface status {
  primary_repos?: boolean;
  syskey?: string;
}

export class app_svc {
  constructor() {
    this.router_after_topic = pubsub.get_topic(pubsub_router_after_topic_name);
    this.router_before_topic = pubsub.get_topic(pubsub_router_before_topic_name);
    this.router_resolve_topic = pubsub.get_topic(pubsub_router_resolve_topic_name);
    this.router_go_topic = pubsub.get_topic(pubsub_router_go_topic_name);
    this.router_push_topic = pubsub.get_topic(pubsub_router_push_topic_name);
    this.router_replace_topic = pubsub.get_topic(pubsub_router_replace_topic_name);
  }

  readonly router_after_topic: Observable<[string, [Route, Route]]>;
  readonly router_before_topic: Observable<[string, [Route, Route]]>;
  readonly router_resolve_topic: Observable<[string, [Route, Route]]>;
  readonly router_go_topic: Observable<[string, number]>;
  readonly router_push_topic: Observable<[string, string]>;
  readonly router_replace_topic: Observable<[string, string]>;

  get settings(): Observable<settings> {
    return util_http.get<settings>('/app/settings');
  }

  router_go(offset: number) {
    pubsub.publish(pubsub_router_go_topic_name, offset);
  }

  router_push(path: string) {
    pubsub.publish(pubsub_router_push_topic_name, path);
  }

  router_replace(path: string) {
    pubsub.publish(pubsub_router_replace_topic_name, path);
  }

  readonly keep_alive: string[] = [];
}

export class app_svc_internal extends app_svc {
  fire_router_after_event(to: Route, from: Route) {
    pubsub.publish(pubsub_router_after_topic_name, [to, from]);
  }

  fire_router_before_event(to: Route, from: Route) {
    pubsub.publish(pubsub_router_before_topic_name, [to, from]);
  }

  fire_router_resolve_event(to: Route, from: Route) {
    pubsub.publish(pubsub_router_resolve_topic_name, [to, from]);
  }
}

export default <app_svc>new app_svc_internal();