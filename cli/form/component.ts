/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { Subject, Subscription, SubscriptionLike } from 'rxjs';
import { component, property, data } from 'component';
import { navbar_service } from '../navbar/svc';
import { popover_event_arg, popover_event_msg } from '../popover/event';
import { popover_confirm_arg, popover_confirm_msg } from '../popover/confirm';
import { PopoverOption } from 'bootstrap';
import Vue, { ComponentOptions, VNode, WatchOptions, CreateElement } from 'vue';
import { NormalizedScopedSlot } from 'vue/types/vnode';
import VueRouter, { Route } from 'vue-router';

export interface form_model {
  is_new?: boolean;
  xhr?: Subscription;
  [_: string]: any;
}

export abstract class form_component implements component, form_model {
  beforeRouteEnter(to: Route, from: Route, next: (to?: (vm: Vue) => any) => void) {
    next(vm => {
      (<form_component>vm).navs.forEach(x => x[0].add(x[1]));
      $((<form_component>vm).$el).find('[autofocus]').focus();
    });
  }

  beforeRouteLeave(to: Route, from: Route, next: (to?: string | false | void) => void) {
    if(this.xhr) {
      this.xhr.unsubscribe();
      this.xhr = undefined;
    }
    for(let nav of this.navs) {
      nav[1].popover('dispose');
      nav[0].remove(nav[1]);
    }
    next();
  }

  can_deactivate(): boolean | PromiseLike<boolean> {
    if(this.xhr) {
      return confirm('are you sure you want to cancel the current request? click "OK" to cancel.')
    }
    if($(this.$el).find('.fi-dirty').length) {
      return confirm('are you sure you want to discard your changes? click "OK" to discard and close this form.')
    }
    return true;
  }

  created() {
    this.forms = [];
    this.unsubscribe = [];
    this.navs = [];
    this.confirm = new Subject<popover_confirm_arg>();
    this.event = new Subject<popover_event_arg>();
    if(!this.reg_form) {
      this.reg_form = new Subject<HTMLFormElement>();
    }
    this.unsubscribe.push(this.reg_form.subscribe(form => this.forms.push(form)));
  }

  destroyed() {
    for(let item of this.unsubscribe) {
      try {
        item.unsubscribe();
      }
      catch(err) {
        console.error(err);
      }
    }
    this.unsubscribe = [];
  }

  protected do_remove(evt: MouseEvent): void { }

  protected do_submit(evt: MouseEvent): void { }

  protected load_data(route: Route) { }

  init_data(data: form_model) {
    data.is_new = this.$route.params._id === '$new';
  }

  mounted() {
    if(this.$refs) {
      if(this.$refs.form && this.reg_form) {
        this.reg_form.next(this.$refs.form);
      }

      if(this.$refs.navbar_items) {
        let navs = this.navs;
        let items = $(this.$refs.navbar_items);
        items.children().each(function() {
          const el = $(this);
          navs.push([new navbar_service(el.prop('id')), el.children()]);
          el.remove();
        });
        items.remove();
      }
    }
  }

  protected popover_confirm(target: EventTarget, message: popover_confirm_msg, opt?: PopoverOption) {
    this.confirm.next(opt ? [target, message, opt] : [target, message]);
  }

  protected popover_event(target: EventTarget, message: popover_event_msg, opt?: PopoverOption) {
    this.event.next(opt ? [target, message, opt] : [target, message]);
  }

  protected remove(evt: MouseEvent) {
    if(this.xhr) {
      this.xhr.unsubscribe();
      this.xhr = undefined;
      this.popover_event(evt.target!, {
        error: '<b>you\'ve cancelled the request.</b><br>however the request may have already been processed.'
      });
    }
    else {
      this.popover_confirm(evt.target!, {
        item: this.confirm_delete,
        result: val => {
          if(val) {
            this.do_remove(evt);
          }
        }
      });
    }
  }

  protected reset_forms() {
    for(let form of this.forms) {
      form.reset();
      for(let i = 0; i < form.length; ++i) {
        $(form[i]).trigger('reset');
      }
    }
  }

  protected submit(evt: MouseEvent) {
    if(this.xhr) {
      this.xhr.unsubscribe();
      this.xhr = undefined;
      this.popover_event(evt.target!, {
        error: '<b>you\'ve cancelled the request.</b><br>however the request may have already been processed.'
      });
    }
    else if(this.forms.every(x => x.reportValidity())) {
      this.do_submit(evt);
    }
    else {
      this.forms.forEach(x => {
        for(let i = 0; i < x.length; ++i) {
          $(x[i]).trigger('blur', evt);
        }
      });
      this.popover_event(evt.target!, { error: 'please correct the form errors.' });
      setTimeout(() => $(evt.target!).popover('hide'), 3000);
    }
  }

  set $route(route: Route) {
    this.load_data(route);
  }

  protected get confirm_delete(): string { return 'this item'; }
  @property() protected reg_form!: Subject<HTMLFormElement>;
  private forms!: HTMLFormElement[];
  protected navs!: [navbar_service, JQuery<Element>][];
  protected confirm!: Subject<popover_confirm_arg>;
  protected event!: Subject<popover_event_arg>;
  protected unsubscribe!: SubscriptionLike[];
  @data() is_new!: boolean;
  @data() xhr?: Subscription;

  // the following are to support Vue components
  readonly $el!: Element;
  readonly $options!: ComponentOptions<Vue>;
  readonly $parent!: Vue;
  readonly $root!: Vue;
  readonly $children!: Vue[];
  readonly $refs!: { navbar_items: Element, form: HTMLFormElement, [key: string]: Vue | Element | Vue[] | Element[] };
  readonly $slots!: { [key: string]: VNode[] | undefined };
  readonly $scopedSlots!: { [key: string]: NormalizedScopedSlot | undefined };
  readonly $isServer!: boolean;
  readonly $data!: Record<string, any>;
  readonly $props!: Record<string, any>;
  readonly $ssrContext!: any;
  readonly $vnode!: VNode;
  readonly $attrs!: Record<string, string>;
  readonly $listeners!: Record<string, Function | Function[]>;
  $mount!: (elementOrSelector?: Element | string, hydrating?: boolean) => this;
  $forceUpdate!: () => void;
  $destroy!: () => void;
  $set!: typeof Vue.set;
  $delete!: typeof Vue.delete;
  $watch!: <T>(expOrFn: any, callback: (this: this, n: T, o: T) => void, options?: WatchOptions) => (() => void);
  $on!: (event: string | string[], callback: Function) => this;
  $once!: (event: string | string[], callback: Function) => this;
  $off!: (event?: string | string[], callback?: Function) => this;
  $emit!: (event: string, ...args: any[]) => this;
  $nextTick!: (callback?: (this: this) => void) => any;
  $createElement!: CreateElement;
  $router!: VueRouter;
}