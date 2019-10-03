/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { util_text } from './text';

export class util_crypto {
  static create_key(id?: string, pwd?: string, domain?: string): Promise<string> {
    return util_crypto.hash(`${domain || ''}${(id || '').trim()}${pwd}`);
  }

  static async hash(buf: string | ArrayBuffer, algo: string = 'SHA-512'): Promise<string> {
    return typeof buf === 'string' ?
      util_text.to_base64(await window.crypto.subtle.digest(algo, util_text.to_buf(buf))) :
      util_text.to_base64(await window.crypto.subtle.digest(algo, buf));
  }
}