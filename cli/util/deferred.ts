/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

export class util_deferred<_t_> {
  constructor() {
    this._promise = new Promise<_t_>((res, rej) => {
      this.reject = x => rej(x);
      this.resolve = x => res(x);
    });
  }

  get promise() { return this._promise; }
  resolve: (value?: _t_ | PromiseLike<_t_>) => void = x => { console.assert(false); };
  reject: (reason?: any) => void = x => { console.assert(false); };
  private _promise: PromiseLike<_t_>;
}