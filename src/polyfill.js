'use strict';

export function polyfill(){
  if('performance' in window === false) {
    let nowOffset = Date.now();
    window.performance = {
      now: function now(){
        return Date.now() - nowOffset;
      }
    };
  }
}