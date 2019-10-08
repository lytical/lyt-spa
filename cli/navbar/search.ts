/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { is_component, property, data } from "../component";
import { Observer } from "rxjs";

export type navbar_search_event = [Event, string | undefined];

@is_component({
  html: 'navbar/search.html'
})
export class navbar_search {
  input(evt: Event) {
    if(this.delay !== undefined) {
      clearTimeout(this.delay);
    }
    this.delay = setTimeout(() => this.search(evt), 500);
  }

  search(evt: Event) {
    if(this.event) {
      this.event.next([evt, this.value])
    }
  }

  @property() protected event?: Observer<navbar_search_event>;
  @property(String) protected placeholder?: string;
  @property(String) protected title?: string;
  @data() value?: string;
  @data() delay?: number;
}