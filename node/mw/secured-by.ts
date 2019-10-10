/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { RequestHandler } from 'express';
import { crypto } from '../lib/crypto';
import { config } from '../lib/config';
import { text } from '../lib/text';
import { container } from '../ioc/container';
import { request } from './request';
import { app_config } from './app';

const window_ms = 60000;

export function secured_by(svc: container): RequestHandler {
  return (rqs: request, rsp, next) => {
    let value = rqs.header('authorization');
    if(value) {
      let seg = value.split(' ');
      if(seg.length === 2 && seg[0] === 'Bearer') {
        seg = seg[1].split(':');
        if(seg.length === 2) {
          let usr: string | undefined;
          try { usr = text.from_base64(seg[0]); } catch(e) { }
          if(usr) {
            let key: string | undefined;
            if(usr === 'sys') {
              let cfg = svc.get<app_config>(config);
              key = cfg ? cfg.syskey : '';
            }
            else {
              console.assert(false, 'todo: get user key');
              key = '' //(<Map<string, string>>rqs.app.get(mw.setting.user_key)).get(usr);
            }
            if(key !== undefined) {
              let now = new Date(Date.now());
              now = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes());
              let crypt = svc.get<crypto>(crypto)!;
              if(crypt.create_key(now.toISOString(), key) === seg[1]) {
                rqs.secured_by = usr;
              }
              else if(crypt.create_key(new Date(now.valueOf() + window_ms).toISOString(), key) === seg[1]) {
                rqs.secured_by = usr;
              }
              else if(crypt.create_key(new Date(now.valueOf() - window_ms).toISOString(), key) === seg[1]) {
                rqs.secured_by = usr;
              }
            }
          }
        }
      }
    }
    next();
  }
}