/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { injectable } from '../ioc/container';
type logger_level = 'debug' | 'info' | 'warn' | 'trace' | 'error';

@injectable()
export abstract class logger {
  debug(msg: any): void { return this.log(msg, 'debug'); }
  error(msg: any): void { return this.log(msg, 'error'); }
  info(msg: any): void { return this.log(msg, 'info'); }
  trace(msg: any): void { return this.log(msg, 'trace'); }
  warn(msg: any): void { return this.log(msg, 'warn'); }
  abstract log(msg: any, level: logger_level): void;

  static create(handler: (msg: any, level: logger_level) => void): logger {
    return {
      debug(msg: any): void { return this.log(msg, 'debug'); },
      error(msg: any): void { return this.log(msg, 'error'); },
      info(msg: any): void { return this.log(msg, 'info'); },
      trace(msg: any): void { return this.log(msg, 'trace'); },
      warn(msg: any): void { return this.log(msg, 'warn'); },
      log(msg: any, level: logger_level): void {
        handler(msg, level);
      }
    };
  }
}