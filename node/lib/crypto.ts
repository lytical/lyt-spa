/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import * as _crypto from 'crypto';
import { injectable } from '../ioc/container';

@injectable()
export class crypto {
  create_key(id?: string, pwd?: string, domain?: string): string {
    return this.hash(`${domain || ''}${(id || '').trim()}${pwd}`);
  }

  hash(buf: string | Buffer | DataView, algo: string = 'sha512', encoding: _crypto.HexBase64Latin1Encoding = 'base64'): string {
    let h = _crypto.createHash(algo);
    h.update(buf);
    return h.digest(encoding);
  }

  decrypt(cipher_txt: string, key: string, algo: string = 'aes256'): string {
    // todo: replace deprecated createDecipher()
    let decipher = _crypto.createDecipher(algo, key);
    return Buffer.concat([decipher.update(cipher_txt, 'base64'), decipher.final()]).toString('utf8');
  }

  encrypt(clear_txt: string, key: string, algo: string = 'aes256'): string {
    // todo: replace deprecated createCipher()
    let cipher = _crypto.createCipher(algo, key);
    return Buffer.concat([cipher.update(clear_txt, 'utf8'), cipher.final()]).toString('base64');
  }
}