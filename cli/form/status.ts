/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { is_directive, directive, directive_binding } from "../directive";
import { VNode } from "vue";

interface form_status_directive_binding extends directive_binding {
  obs: MutationObserver[];
}

@is_directive()
export class form_status extends directive {
  bind(el: HTMLElement, binding: form_status_directive_binding, vnode: VNode, oldVnode: VNode): void {
    binding.obs = [];
  }

  inserted(el: HTMLElement, binding: form_status_directive_binding, vnode: VNode, oldVnode: VNode): void {
    if(binding.arg) {
      const me = $(el);
      const item = $(binding.arg).find('div.form-group.row');
      const update = (check: string, reciprocal: string) => {
        if(item.filter(function() {
          return $(this).hasClass(check)
        }).length) {
          me.removeClass(reciprocal);
          me.addClass(check);
        }
        else {
          me.removeClass(check);
          me.addClass(reciprocal);
        }
      }
      const all = (check: string) => {
        if(item.filter(function() {
          return $(this).hasClass(check)
        }).length === item.length) {
          me.addClass(`${check}-all`);
        }
        else {
          me.removeClass(`${check}-all`);
        }
      }
      const changed = (mutations?: MutationRecord[]) => {
        update('fi-invalid', 'fi-valid');
        update('fi-touched', 'fi-untouched');
        update('fi-dirty', 'fi-pristine');
        all('fi-invalid');
        all('fi-touched');
        all('fi-dirty');
        all('fi-valid');
        all('fi-untouched');
        all('fi-pristine');
      }
      const opt = {
        attributeFilter: ['class']
      };
      item.each(function() {
        let obs = new MutationObserver(changed);
        obs.observe(this, opt);
        binding.obs.push(obs);
      });
      changed();
    }
  }

  unbind(el: HTMLElement, binding: form_status_directive_binding, vnode: VNode, oldVnode: VNode): void {
    for(let o of binding.obs) {
      o.disconnect();
    }
    binding.obs = [];
  }
}