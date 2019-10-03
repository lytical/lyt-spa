import { buffer } from "./buffer";

/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

export enum text_color {
  reset = '\x1b[0m',
  bright = '\x1b[1m',
  dim = '\x1b[2m',
  underscore = '\x1b[4m',
  blink = '\x1b[5m',
  reverse = '\x1b[7m',
  hidden = '\x1b[8m',
  fg_black = '\x1b[30m',
  fg_red = '\x1b[31m',
  fg_green = '\x1b[32m',
  fg_yellow = '\x1b[33m',
  fg_blue = '\x1b[34m',
  fg_magenta = '\x1b[35m',
  fg_cyan = '\x1b[36m',
  fg_white = '\x1b[37m',
  bg_black = '\x1b[40m',
  bg_red = '\x1b[41m',
  bg_green = '\x1b[42m',
  bg_yellow = '\x1b[43m',
  bg_blue = '\x1b[44m',
  bg_magenta = '\x1b[45m',
  bg_cyan = '\x1b[46m',
  bg_white = '\x1b[47m'
}

export class text {
  static debug(txt: string): string {
    return `${text_color.fg_cyan}${txt}${text_color.reset}`
  }

  static error(txt: string): string {
    return `${text_color.bg_red}${txt}${text_color.reset}`
  }

  static trace(txt: string): string {
    return `${text_color.fg_green}${txt}${text_color.reset}`
  }

  static warn(txt: string): string {
    return `${text_color.fg_yellow}${txt}${text_color.reset}`
  }

  static cast(arg: string): any {
    if(arg.startsWith('\'') && arg.endsWith('\''))
      return arg.substr(1, arg.length - 2);
    switch(arg) {
      case 'NaN':
        return Number.NaN;
      case 'null':
        return null;
      case 'undefined':
        return undefined;
      case 'true':
        return true;
      case 'false':
        return false;
    }
    if(text.is_date_pattern.test(arg)) {
      try {
        return new Date(Date.parse(arg));
      } catch(e) {
      }
    }
    if(text.is_num_pattern.test(arg)) {
      try {
        return Number.parseFloat(arg);
      } catch(e) {
      }
    }
    return arg;
  }

  static from_base64(buf: string, encoding: string = 'utf8'): string {
    return buffer.from_base64(buf).toString(encoding);
  }

  static normalize_str(val: string, dict: any = process.env) {
    let match = val.match(/%[^%]+?%/g);
    if(match) {
      for(let x of match) {
        val = val.replace(x, dict[x.substr(1, x.length - 2)]);
      }
    }
    return val;
  }

  static to_base64(buf: string): string {
    return Buffer.from(buf).toString('base64');
  }

  static readonly is_date_pattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,7})?)?([zZ]|(\+|\-)\d{2}:\d{2})?)?$/;
  static readonly is_num_pattern = /^-?(0|[1-9]\d*)(\.\d+)?([eE][\-\+]\d+)?$/;
}