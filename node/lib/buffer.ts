/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

export class buffer {
  static from_base64(buf: string): Buffer {
    return Buffer.from(buf, 'base64');
  }

  static to_base64(buf: string): Buffer {
    return Buffer.from(buf);
  }
}