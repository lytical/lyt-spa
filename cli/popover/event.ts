/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { is_component } from '../component';
import { popover_component, popover_msg_arg, popover_msg_observable } from './component';
import { PopoverOption } from 'bootstrap';

export interface popover_event_msg {
  error?: string;
  info?: string;
  success?: string;
}

export type popover_event_arg = popover_msg_arg<popover_event_msg>;
export type popover_event_observable = popover_msg_observable<popover_msg_arg>;

@is_component({
  html: 'popover/event.html'
})
export class popover_event extends popover_component<popover_event_msg> implements popover_event_msg {
  data() {
    return <popover_event_msg>{
      error: undefined,
      info: undefined,
      success: undefined
    };
  }

  protected on_hide() {
    this.error = this.info = this.success = undefined;
    super.on_hide();
  }

  protected on_show(msg: popover_event_msg, opt?: PopoverOption): PopoverOption {
    this.error = this.info = this.success = undefined;
    Object.assign(this, msg);
    return Object.assign({}, opt, {
      trigger: msg.info ? 'manual' : 'focus'
    });
  }

  error?: string;
  success?: string;
  info?: string;
}