/* @preserve
  (c) 2018 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

export type state_method = (...args: any[]) => number;

export class state_machine {
  constructor(private init_state: number, ...states: state_method[]) {
    console.assert(Array.isArray(states) && states.length && states.every(x => typeof x === 'function'));
    console.assert(typeof this.init_state === 'number' && this.init_state >= 0 && this.init_state < states.length);
    this.states = states;
    this.state = this.init_state | 0;
  }

  invoke(self: any, ...args: any[]): boolean {
    this.state = this.states[this.state].apply(self, args) | 0;
    if(this.state < 0 || this.state >= this.states.length) {
      this.state = this.init_state | 0;
      return false;
    }
    return true;
  }

  reset() {
    this.state = this.init_state | 0;
  }

  get current_state() {
    return this.state;
  }

  set current_state(state: number) {
    console.assert(state >= 0 && state < this.states.length);
    this.state = state | 0;
  }

  private state: number;
  private states: state_method[];
}