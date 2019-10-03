/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

export class util_object {
  static find(obj: any, predicate: (obj: any) => boolean): any | undefined {
    while(obj) {
      if(predicate(obj)) {
        return obj;
      }
      obj = obj.prototype;
    }
    return undefined;
  }

  static has(obj: any, predicate: (obj: any) => boolean): boolean {
    while(obj) {
      if(predicate(obj)) {
        return true;
      }
      obj = obj.prototype;
    }
    return false;
  }
}