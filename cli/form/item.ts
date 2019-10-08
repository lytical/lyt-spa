/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { is_component, component, data, property } from '../component';

interface model {
  is_touched?: boolean;
  is_dirty?: boolean;
  is_valid?: boolean;
}

@is_component({
  html: 'form/item.html'
})
export class form_item implements component, model {
  mounted() {
    let $el = $(this.$el).find(`#${this.id}`);
    if($el.length) {
      let el = <HTMLInputElement>$el.get(0);
      const is_valid = () => el && typeof el.checkValidity === 'function' ? el.checkValidity() : true;
      $el.on('blur', () => {
        this.is_touched = true;
        this.is_valid = is_valid();
      });
      $el.on('input', () => {
        this.is_dirty = true;
        this.is_valid = is_valid();
      });
      $el.on('invalid', () => {
        this.is_valid = false;
      });
      $el.on('reset', () => {
        this.is_touched = false;
        this.is_dirty = false;
        this.is_valid = is_valid();
      });
      $el.trigger('reset');
    }
  }

  @property(String) caption?: string;
  @property(String) id?: string;
  @property(String) invalid_msg?: string;
  @data(false) is_touched?: boolean;
  @data(false) is_dirty?: boolean;
  @data(true) is_valid?: boolean;
  get is_pristine() { return !this.is_dirty; }
  get is_invalid() { return !this.is_valid; }
  get is_untouched() { return !this.is_touched; }
  $el!: Element;
}