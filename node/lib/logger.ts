/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { injectable } from '../ioc/container';
import { text } from './text';
type logger_level = 'debug' | 'info' | 'warn' | 'trace' | 'error';

@injectable(logger.create((msg, level) => {
  switch(level) {
    case 'debug':
      console.debug(text.debug(msg.toString()));
      break;
    case 'error':
      console.error(text.error(msg.toString()));
      break;
    case 'info':
      console.info(msg);
      break;
    case 'trace':
      console.trace(text.trace(msg.toString()));
      break;
    case 'warn':
      console.warn(text.warn(msg.toString()));
      break;
  }
}))
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