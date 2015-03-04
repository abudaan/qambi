
'use strict';

import {getProtectedScope} from './sequencer';

let
  slice = Array.prototype.slice,

  mPow = Math.pow,
  mRound = Math.round,
  mFloor = Math.floor,
  mRandom = Math.random,
  protectedScope = getProtectedScope(),
  context = protectedScope.context,
  // floor = function(value){
  //  return value | 0;
  // },

  noteLengthNames = {
      1: 'quarter',
      2: 'eighth',
      4: 'sixteenth',
      8: '32th',
      16: '64th'
  };


export function typeString(o){
  if(typeof o != 'object'){
    return typeof o;
  }

  if(o === null){
    return 'null';
  }

  //object, array, function, date, regexp, string, number, boolean, error
  let internalClass = Object.prototype.toString.call(o).match(/\[object\s(\w+)\]/)[1];
  return internalClass.toLowerCase();
}


