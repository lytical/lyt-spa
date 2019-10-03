/* @preserve
  (c) 2019 lytical, inc. all rights are reserved.
  lytical(r) is a registered trademark of lytical, inc.
  please refer to your license agreement on the use of this file.
*/

import { PopoverOption } from 'bootstrap';

export class popover {
  constructor(private opt: PopoverOption) {
  }

  dispose() {
    $(this.target).popover('dispose');
  }

  hide() {
    $(this.target).popover('hide');
  }

  is_different(opt: PopoverOption): boolean {
    return (opt.content !== undefined && opt.content !== this.opt.content) ||
      (opt.animation !== undefined && opt.animation !== this.opt.animation) ||
      (opt.container !== undefined && opt.container !== this.opt.container) ||
      (opt.delay !== undefined && opt.delay !== this.opt.delay) ||
      (opt.html !== undefined && opt.html !== this.opt.html) ||
      (opt.placement !== undefined && opt.placement !== this.opt.placement) ||
      (opt.selector !== undefined && opt.selector !== this.opt.selector) ||
      (opt.template !== undefined && opt.template !== this.opt.template) ||
      (opt.title !== undefined && opt.title !== this.opt.title) ||
      (opt.trigger !== undefined && opt.trigger !== this.opt.trigger) ||
      (opt.offset !== undefined && opt.offset !== this.opt.offset) ||
      (opt.fallbackPlacement !== undefined && opt.fallbackPlacement !== this.opt.fallbackPlacement) ||
      (opt.boundary !== undefined && opt.boundary !== this.opt.boundary) ||
      (opt.sanitize !== undefined && opt.sanitize !== this.opt.sanitize) ||
      (opt.whiteList !== undefined && opt.whiteList !== this.opt.whiteList) ||
      (opt.sanitizeFn !== undefined && opt.sanitizeFn !== this.opt.sanitizeFn);
  }

  show(target: EventTarget, opt?: PopoverOption) {
    if(this.target.length) {
      if(this.target.get(0) !== target || (opt && this.is_different(opt))) {
        this.target.popover('dispose');
      }
      else {
        this.target.popover('show');
        this.target.popover('update');
        return;
      }
    }
    if(opt !== undefined) {
      Object.assign(this.opt, opt);
    }
    this.target = $(target);
    this.target.popover(this.opt);
    if(this.opt.trigger === 'focus') {
      this.target.on('hidden.bs.popover', () => {
        this.target.popover('dispose');
        this.opt.trigger = 'manual';
        this.target.popover(this.opt);
      });
    }
    this.target.popover('show');
  }

  update() {
    $(this.target).popover('update');
  }

  private target: JQuery<EventTarget> = $();
}