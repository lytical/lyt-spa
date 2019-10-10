/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { is_component, data } from '../component';
import { popover_confirm, popover_confirm_msg } from './confirm';
import { PopoverOption } from 'bootstrap';

export interface popover_can_delete_msg extends popover_confirm_msg {
  item: string;
}

@is_component({
  html: 'popover/can-delete.html'  
})
export class popover_can_delete extends popover_confirm {
  click(value: boolean) {
    this.confirm = '';
    super.click(value);
  }

  protected on_show(msg: popover_can_delete_msg, opt?: PopoverOption): PopoverOption {
    this.item = msg.item;
    return super.on_show(msg, opt);
  }

  get is_disabled() {
    return this.confirm !== this.item;
  }

  @data() private confirm?: string;
  @data('item') private item?: string;
}