/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { Observable, Observer } from 'rxjs';
import { util_crypto } from './crypto';
import { util_text } from './text';

const xsrf_token_header: string = 'X-XSRF-TOKEN';
type data_type = 'json' | 'xml' | 'html' | 'script' | 'jsonp' | 'text' | string;

export class util_http {
  static send<_t_ = unknown>(settings: JQuery.AjaxSettings): Observable<_t_> {
    return Observable.create((obs: Observer<_t_>) => {
      settings.success = rs => obs.next(rs);
      settings.error = err => obs.error(err);
      settings.complete = () => obs.complete();
      const xhr = $.ajax(settings);
      return () => xhr.abort();
    });
  }

  static send_secure<_t_ = unknown>(settings: JQuery.AjaxSettings, uid: string, pwd: string): Observable<_t_> {
    return Observable.create((obs: Observer<_t_>) => {
      let xhr: JQuery.jqXHR;
      util_http.get_secure_header(uid, pwd)
        .then(hdr => {
          settings.headers = Object.assign(settings.headers || {}, hdr);
          settings.success = rs => obs.next(rs);
          settings.error = err => obs.error(err);
          settings.complete = () => obs.complete();
          xhr = $.ajax(settings);
        })
        .catch(err => obs.error(err));
      return () => xhr.abort();
    });
  }

  static delete<_t_ = unknown>(url: string, data?: object | string, dataType: data_type = 'json', headers?: JQuery.PlainObject): Observable<_t_> {
    return util_http.send({
      method: 'DELETE',
      data,
      headers,
      url,
      dataType
    });
  }

  static delete_secure<_t_ = unknown>(uid: string, pwd: string, url: string, data?: object | string, dataType: data_type = 'json', headers?: JQuery.PlainObject): Observable<_t_> {
    return util_http.send_secure({
      method: 'DELETE',
      data,
      headers,
      url,
      dataType
    }, uid, pwd);
  }

  static get<_t_ = unknown>(url: string, data?: object | string, dataType: data_type = 'json', headers?: JQuery.PlainObject): Observable<_t_> {
    return util_http.send({
      data,
      headers,
      url,
      dataType
    });
  }

  static get_secure<_t_ = unknown>(uid: string, pwd: string, url: string, data?: object | string, dataType: data_type = 'json', headers?: JQuery.PlainObject): Observable<_t_> {
    return util_http.send_secure({
      data,
      headers,
      url,
      dataType
    }, uid, pwd);
  }

  static post<_t_ = unknown>(url: string, data?: object | string, dataType: data_type = 'json', headers?: JQuery.PlainObject): Observable<_t_> {
    return util_http.send({
      method: 'POST',
      contentType: data !== undefined ? 'application/json' : undefined,
      data: data !== undefined ? JSON.stringify(data) : undefined,
      headers,
      url,
      dataType,
      processData: false
    });
  }

  static post_secure<_t_ = unknown>(uid: string, pwd: string, url: string, data?: object | string, dataType: data_type = 'json', headers?: JQuery.PlainObject): Observable<_t_> {
    return util_http.send_secure({
      method: 'POST',
      contentType: data !== undefined ? 'application/json' : undefined,
      data: data !== undefined ? JSON.stringify(data) : undefined,
      headers,
      url,
      dataType,
      processData: false
    }, uid, pwd);
  }

  static put<_t_ = unknown>(url: string, data?: object | string, dataType: data_type = 'json', headers?: JQuery.PlainObject): Observable<_t_> {
    return util_http.send({
      method: 'PUT',
      contentType: data !== undefined ? 'application/json' : undefined,
      data: data !== undefined ? JSON.stringify(data) : undefined,
      headers,
      url,
      dataType,
      processData: false
    });
  }

  static put_secure<_t_ = unknown>(uid: string, pwd: string, url: string, data?: object | string, dataType: data_type = 'json', headers?: JQuery.PlainObject): Observable<_t_> {
    return util_http.send_secure({
      method: 'PUT',
      contentType: data !== undefined ? 'application/json' : undefined,
      data: data !== undefined ? JSON.stringify(data) : undefined,
      headers,
      url,
      dataType,
      processData: false
    }, uid, pwd);
  }

  static init(version: string) {
    $(document).ajaxSend((evt, xhr, opt) => {
      if(!opt.crossDomain) {
        xhr.setRequestHeader('x-lyt-version', version);
        if(opt.type === 'GET' || opt.type === 'HEAD') {
          return;
        }
        let token = util_http.get_xsrf_token();
        if(token) {
          xhr.setRequestHeader(xsrf_token_header, token);
        }
      }
    });
  }

  static async get_secure_header(usr: string, key: string, domain?: string): Promise<JQuery.PlainObject> {
    key = await util_crypto.create_key(usr, key, domain);
    let dt = new Date(Date.now());
    let token = await util_crypto.create_key(new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), dt.getUTCHours(), dt.getUTCMinutes()).toISOString(), key);
    return { Authorization: `Bearer ${util_text.to_base64(usr)}:${token}` };
  }

  static get_xsrf_token(): string | undefined {
    let rs = /XSRF\-TOKEN=([^;\s]+)/.exec(window.document.cookie);
    return rs && rs.length > 1 ? rs[1] : undefined;
  }
}