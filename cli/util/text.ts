/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

export class util_text {
  static from_base64(buf: ArrayBuffer | string): string {
    return atob(util_text.from_buf(typeof buf === 'string' ? util_text.to_buf(buf) : buf));
  }

  static from_buf(buf: ArrayBuffer): string {
    return String.fromCharCode.apply(null, <any>new Uint8Array(buf));
  }

  static to_base64(buf: ArrayBuffer | string): string {
    return util_text.from_buf(util_text.to_buf(btoa(typeof buf === 'string' ? buf : util_text.from_buf(buf))));
  }

  static to_buf(str: string): ArrayBuffer {
    let rt = new Uint8Array(str.length);
    for(var i = 0; i < str.length; ++i)
      rt[i] = str.charCodeAt(i);
    return rt.buffer;
  }
}