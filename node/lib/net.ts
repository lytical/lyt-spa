/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as _net from 'net';

export class port {
  static async get_available_from(value: number): Promise<number> {
    let is_used = await port.is_used(value);
    if(is_used) {
      if(++value <= 0xffff) {
        return await port.get_available_from(value);
      }
      else {
        throw new Error('not available');
      }
    }
    return value;
  }

  static is_used(value: number, host: string = '127.0.0.1'): Promise<boolean> {
    return new Promise<boolean>((res, rej) => {
      let svr = _net.createServer();
      svr.once('error', err => {
        res(true);
      });
      svr.once('listening', () => {
        svr.close();
        res(false);
      });
      svr.listen({
        host: host,
        port: value,
        exclusive: true
      });
    });
  }
}