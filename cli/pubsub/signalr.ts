/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as signalr from '@aspnet/signalr';
import pubsub_svc, { pubsub_topic_id_sock_closed, pubsub_topic_id_sock_opened, pubsub_topic_id_sock_recv } from './svc';

const max_timeout = 30000; // 30 secs

class pubsub extends pubsub_svc {
  connect() {
    let was_opened = false;
    let sock = new signalr.HubConnectionBuilder().withUrl('/sock/info').build();
    sock.on('recv', (id, payload) => this.publish(pubsub_topic_id_sock_recv(id), payload));
    sock.onclose(err => {
      if(was_opened) {
        this.publish(pubsub_topic_id_sock_closed);
        this.sock_id = undefined;
        console.info('signalr-closed. attempting to reopen...');
      }
      this.reconnect();
    });
    sock.start()
      .then(() =>
        sock.invoke('get_client_id').then(sock_id => {
          this.sock_id = sock_id;
          this.timeout = undefined;
          console.info('signalr-opened');
          console.info(`sock-id:${this.sock_id}`);
          this.publish(pubsub_topic_id_sock_opened, this.sock_id);
          was_opened = true;
        })
        .catch(err => {
          console.error(err);
          this.reconnect();
        }))
      .catch(err => {
        console.error(err);
        this.reconnect();
      });
  }

  private reconnect() {
    switch(this.timeout) {
      case undefined:
        this.timeout = 0;
        break;
      case 0:
        this.timeout = 100;
        break;
      default:
        this.timeout = Math.min(this.timeout + 50, max_timeout);
        break;
    }
    setTimeout(() => this.connect(), this.timeout);
  }

  get client_id() {
    return this.sock_id;
  }

  private timeout?: number;
  private sock_id?: any;
}

export default new pubsub();