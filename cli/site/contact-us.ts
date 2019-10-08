/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { component, is_component, data } from "../component";
import svc, { site_contact_us_msg } from './svc';
import { Subscription, Subject } from 'rxjs';
import { popover_event_arg } from '../popover/event';

@is_component({
  html: 'site/contact-us.html',
  route: ['/site/contact-us']
})
export class site_contact_us implements component {
  created() {
    this.notify = new Subject<popover_event_arg>();
  }

  destroyed() {
    if(this.xhr) {
      this.xhr.unsubscribe();
    }
  }

  init_data(data: { msg: site_contact_us_msg }) {
    data.msg = svc.blank_contact_us_msg;
  }

  send_message(evt: Event) {
    let btn = $(evt.target!).find('button[type=submit]');
    if(btn.length) {
      this.notify.next([btn[0], { info: 'please wait while we send your message...' }]);
    }
    if(this.xhr) {
      this.xhr.unsubscribe();
      this.xhr = undefined;
      if(btn.length) {
        this.notify.next([btn[0], { error: `sending message is canceled.` }]);
      }
      return;
    }
    this.xhr = svc.send_msg(this.msg).subscribe(
      rs => {},
      err => {
        this.xhr = undefined;
        console.error(err);
        if(btn.length) {
          this.notify.next([btn[0], { error: `sorry, but we are unable to send your message. <b>${err.message || err.statusText}</b>` }]);
        }
      },
      () => {
        this.xhr = undefined;
        (<HTMLFormElement>evt.target).reset();
        Object.assign(this.msg, svc.blank_contact_us_msg);
        if(btn.length) {
          this.notify.next([btn[0], { success: 'thank you for your message.' }]);
        }
      }
    );
  }

  @data() msg!: site_contact_us_msg;
  @data() xhr?: Subscription;
  private notify!: Subject<popover_event_arg>;
}