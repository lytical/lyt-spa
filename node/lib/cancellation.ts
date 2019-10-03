/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

export interface cancellation_token {
  readonly is_cancelled: boolean;
}

export class cancellation {
  cancel() {
    this.is_cancelled = true;
  }

  get token(): cancellation_token {
    const self = this;
    return {
      get is_cancelled() { return self.is_cancelled; }
    }
  }

  private is_cancelled = false;
}