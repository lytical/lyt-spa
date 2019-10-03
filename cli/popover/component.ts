/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { PopoverOption } from 'bootstrap';
import { Subscription, Observable } from 'rxjs';
import { component, property, is_component } from '../component';
import { popover } from './main';

export type popover_msg_arg<_t_ = any> = [EventTarget, _t_] | [EventTarget, _t_, PopoverOption] | null;
export type popover_msg_observable<_t_ = any> = Observable<popover_msg_arg<_t_>>;

@is_component({
  html: 'popover/component.html'
})
export class popover_component<_t_ = any> implements component {
  destroyed() {
    if(this.popover) {
      this.popover.dispose();
    }
    if(this.sub) {
      this.sub.unsubscribe();
      this.sub = undefined;
    }
  }

  protected hide() {
    if(this.popover) {
      this.popover.hide();
    }
  }

  mounted() {
    if(this.$el) {
      this.popover = new popover({ content: this.$el, html: true, trigger: 'manual' });
      if(typeof this.event === 'object' && typeof this.event.subscribe === 'function') {
        this.sub = this.event.subscribe(evt => {
          if(evt === null) {
            this.on_hide();
            this.popover!.hide();
          }
          else {
            switch(evt.length) {
              case 2:
                this.popover!.show(evt[0], this.on_show(evt[1]));
                break;
              case 3:
                this.popover!.show(evt[0], this.on_show(evt[1], evt[2]));
                break;
            }
          }
        });
      }
    }
  }

  protected on_hide(): void { }

  protected on_show(msg: _t_, opt?: PopoverOption): PopoverOption {
    return opt || {};
  }

  @property() private event?: popover_msg_observable<_t_>;
  private popover?: popover;
  private sub?: Subscription;
  $el?: Element;
}