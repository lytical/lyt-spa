/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as Vue from 'vue';
import * as VueRouter from 'vue-router';
import { Route, RawLocation } from 'vue-router';
import app_svc, { settings, app_svc_internal } from './svc';
import { component } from '../component';
import pubsub from 'pubsub';
import { util_http } from '../util/http';
import { ErrorHandler } from 'vue-router/types/router';
import { directive } from '../directive';

const version = '0.0.0';

console.info(`lyt-spa version ${version}`);
console.info('© 2019 lytical, inc. all rights are reserved. lytical® is a registered trademark of lytical, inc.');

let settings: settings = {
  component: [],
  directive: [],
  user: ''
};

type next_method = (to: RawLocation | false | void) => void;
type gaurd_method = (to: Route, from: Route, next: next_method) => any;

util_http.init(version);

app_svc.settings.subscribe(
  async rs => {
    try {
      Object.assign(settings, rs);
      for(let id of rs.directive) {
        const dir_id = id.replace(/\//g, '-');
        (<any>Vue).directive(dir_id, await directive.create(id));
      }
      const routes: { path: string, component: any }[] = [];
      for(let id of rs.component) {
        const cmp_id = id.replace(/\//g, '-');
        let cmp = await component.create(id, prototype => {
          let md = component.get_metadata(prototype);
          if(md && md.route) {
            let can_deactivate = prototype.can_deactivate;
            if(typeof can_deactivate === 'function') {
              let org_beforeRouteLeave = prototype.beforeRouteLeave;
              prototype.beforeRouteLeave = function(to: Route, from: Route, next: (to?: RawLocation | false | void) => any) {
                function handle(rs: boolean, ctx: any) {
                  if(!rs) {
                    next(false);
                    return;
                  }
                  if(org_beforeRouteLeave) {
                    (<gaurd_method>org_beforeRouteLeave).call(ctx, to, from, next);
                  }
                  else {
                    next();
                  }
                }
                let rs = can_deactivate.call(this);
                if(typeof rs === 'boolean') {
                  handle(rs, this);
                }
                else if(rs && typeof rs.then === 'function') {
                  rs.then((val: boolean) => handle(val, this));
                  if(rs.catch === 'function') {
                    rs.catch((err: Error) => {
                      console.error(err);
                      handle(true, this);
                    });
                  }
                }
                else {
                  handle(true, this);
                }
              }
            }
          }
        });
        (<any>Vue).component(cmp_id, cmp);
        let rte = component.get_metadata(cmp);
        if(rte) {
          if(rte.route) {
            for(let path of rte.route) {
              routes.push({ component: cmp, path });
            }
          }
          if(rte.keep_alive) {
            app_svc.keep_alive.push(cmp_id);
          }
        }
      }
      (<any>Vue).use(VueRouter);
      const router: {
        beforeEach(guard: VueRouter.NavigationGuard): Function;
        beforeResolve(guard: VueRouter.NavigationGuard): Function;
        afterEach(hook: (to: Route, from: Route) => any): Function;
        push(location: RawLocation, onComplete?: Function, onAbort?: ErrorHandler): void;
        replace(location: RawLocation, onComplete?: Function, onAbort?: ErrorHandler): void;
        go(n: number): void;
      } = new (<any>VueRouter)({ routes });
      router.afterEach((to: Route, from: Route) => {
        (<app_svc_internal>app_svc).fire_router_after_event(to, from);
      });
      router.beforeEach((to: Route, from: Route, next: (to?: false | void) => any) => {
        (<app_svc_internal>app_svc).fire_router_before_event(to, from);
        next();
      });
      router.beforeResolve((to: Route, from: Route, next: (to?: false | void) => any) => {
        (<app_svc_internal>app_svc).fire_router_resolve_event(to, from);
        next();
      });
      new (<any>Vue)({
        data: settings,
        router
      }).$mount('#app');
      app_svc.router_go_topic.subscribe(msg => router.go(msg[1]));
      app_svc.router_push_topic.subscribe(msg => router.push(msg[1]));
      app_svc.router_replace_topic.subscribe(msg => router.replace(msg[1]));

    } catch(err) {
      alert(err.message || err.statusText);
    }
  },
  err => alert(err.message || err.statusText),
  () => pubsub.connect());