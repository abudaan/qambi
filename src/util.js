import fetch from 'isomorphic-fetch'

const
  mPI = Math.PI,
  mPow = Math.pow,
  mRound = Math.round,
  mFloor = Math.floor,
  mRandom = Math.random


export function getNiceTime(millis){
  let h, m, s, ms,
    seconds,
    timeAsString = '';

  seconds = millis / 1000; // → millis to seconds
  h = mFloor(seconds / (60 * 60));
  m = mFloor((seconds % (60 * 60)) / 60);
  s = mFloor(seconds % (60));
  ms = mRound((seconds - (h * 3600) - (m * 60) - s) * 1000);

  timeAsString += h + ':';
  timeAsString += m < 10 ? '0' + m : m;
  timeAsString += ':';
  timeAsString += s < 10 ? '0' + s : s;
  timeAsString += ':';
  timeAsString += ms === 0 ? '000' : ms < 10 ? '00' + ms : ms < 100 ? '0' + ms : ms;

  //console.log(h, m, s, ms);
  return {
    hour: h,
    minute: m,
    second: s,
    millisecond: ms,
    timeAsString: timeAsString,
    timeAsArray: [h, m, s, ms]
  };
}


// adapted version of https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js
export function base64ToBinary(input){
  let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    bytes, uarray, buffer,
    lkey1, lkey2,
    chr1, chr2, chr3,
    enc1, enc2, enc3, enc4,
    i, j = 0;

  bytes = Math.ceil((3 * input.length) / 4.0);
  buffer = new ArrayBuffer(bytes);
  uarray = new Uint8Array(buffer);

  lkey1 = keyStr.indexOf(input.charAt(input.length - 1));
  lkey2 = keyStr.indexOf(input.charAt(input.length - 1));
  if(lkey1 == 64) bytes--; //padding chars, so skip
  if(lkey2 == 64) bytes--; //padding chars, so skip

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

  for(i = 0; i < bytes; i += 3) {
    //get the 3 octects in 4 ascii chars
    enc1 = keyStr.indexOf(input.charAt(j++));
    enc2 = keyStr.indexOf(input.charAt(j++));
    enc3 = keyStr.indexOf(input.charAt(j++));
    enc4 = keyStr.indexOf(input.charAt(j++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    uarray[i] = chr1;
    if(enc3 != 64) uarray[i+1] = chr2;
    if(enc4 != 64) uarray[i+2] = chr3;
  }
  //console.log(buffer);
  return buffer;
}


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


export function sortEvents(events){
  events.sort(function(a, b){
    if(a.ticks === b.ticks){
      let r = a.type - b.type;
      if(a.type === 176 && b.type === 144){
        r = -1
      }
      return r
    }
    return a.ticks - b.ticks
  })
}

export function checkIfBase64(data){
  let passed = true;
  try{
    atob(data);
  }catch(e){
    passed = false;
  }
  return passed;
}

export function getEqualPowerCurve(numSteps, type, maxValue) {
  let i, value, percent,
    values = new Float32Array(numSteps)

  for(i = 0; i < numSteps; i++){
    percent = i / numSteps
    if(type === 'fadeIn'){
      value = Math.cos((1.0 - percent) * 0.5 * mPI) * maxValue
    }else if(type === 'fadeOut'){
      value = Math.cos(percent * 0.5 * Math.PI) * maxValue
    }
    values[i] = value
    if(i === numSteps - 1){
      values[i] = type === 'fadeIn' ? 1 : 0
    }
  }
  return values
}
