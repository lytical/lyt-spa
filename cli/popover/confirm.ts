/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { is_component } from '../component';
import { popover_msg_arg, popover_msg_observable, popover_component } from './component';
import { PopoverOption } from 'bootstrap';

export interface popover_confirm_msg {
  [_: string]: any;
  result?(value: boolean): void;
}

export type popover_confirm_arg = popover_msg_arg<popover_confirm_msg>;
export type popover_confirm_observable = popover_msg_observable<popover_msg_arg>;

@is_component({
  html: 'popover/confirm.html'
})
export class popover_confirm extends popover_component<popover_confirm_msg> implements popover_confirm_msg {
  created() {
    this.result = val => { console.assert(false); }
  }

  click(value: boolean) {
    this.hide();
    if(this.result) {
      this.result(value);
    }
  }

  protected on_show(msg: popover_confirm_msg, opt?: PopoverOption): PopoverOption {
    this.result = msg.result;
    return Object.assign({}, opt, { trigger: 'manual' });
  }

  get is_disabled() {
    return false;
  }

  result?(value: boolean): void;
}