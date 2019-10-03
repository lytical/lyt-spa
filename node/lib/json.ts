/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

export function json_reviver(key: string, value: any): any { }
export function json_replacer(key: string, value: any): any { }

export class json {
  static reviver(key: string, value: any): any {
    return value;
  }

  static replacer(key: string, value: any): any {
    return value;
  }
}