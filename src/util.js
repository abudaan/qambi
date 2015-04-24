/*
  An unorganised collection of various utility functions that are used across the library
*/

'use strict';

import getConfig from './config';

let
  console = window.console,
  mPow = Math.pow,
  mRound = Math.round,
  mFloor = Math.floor,
  mRandom = Math.random,
  config = getConfig();
  // context = config.context,
  // floor = function(value){
  //  return value | 0;
  // },

const
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



export function ajax(config){
  let
    request = new XMLHttpRequest(),
    method = config.method === undefined ? 'GET' : config.method,
    fileSize;

  function executor(resolve, reject){

    reject = reject || function(){};
    resolve = resolve || function(){};

    request.onload = function(){
      if(request.status !== 200){
        reject(request.status);
        return;
      }

      if(config.responseType === 'json'){
        fileSize = request.response.length;
        resolve(JSON.parse(request.response), fileSize);
        request = null;
      }else{
        resolve(request.response);
        request = null;
      }
    };

    request.onerror = function(e){
        config.onError(e);
    };

    request.open(method, config.url, true);

    if(config.overrideMimeType){
        request.overrideMimeType(config.overrideMimeType);
    }

    if(config.responseType){
        if(config.responseType === 'json'){
            request.responseType = 'text';
        }else{
            request.responseType = config.responseType;
        }
    }

    if(method === 'POST') {
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }

    if(config.data){
        request.send(config.data);
    }else{
        request.send();
    }
  }

  return new Promise(executor);
}


function parseSample(sample, id, every){
  return new Promise(function(resolve, reject){
    try{
      config.context.decodeAudioData(sample,
        function onSuccess(buffer){
          //console.log(id, buffer);
          if(id !== undefined){
            resolve({'id': id, 'buffer': buffer});
            if(every){
              every({'id': id, 'buffer': buffer});
            }
          }else{
            resolve(buffer);
            if(every){
              every(buffer);
            }
          }
      },
      function onError(e){
        //console.log('error decoding audiodata', id, e);
        //reject(e); // don't use reject because we use this as a nested promise and we don't want the parent promise to reject
        if(id !== undefined){
          resolve({'id': id, 'buffer': undefined});
        }else{
          resolve(undefined);
        }
      }
    );
    }catch(e){
      //console.log('error decoding audiodata', id, e);
      //reject(e);
      if(id !== undefined){
        resolve({'id': id, 'buffer': undefined});
      }else{
        resolve(undefined);
      }
    }
  });
}


function loadAndParseSample(url, id, every){
  return new Promise(function executor(resolve, reject){
    ajax({url: url, responseType: 'arraybuffer'}).then(
      function onFulfilled(data){
        parseSample(data, id, every).then(resolve, reject);
      },
      function onRejected(){
        if(id !== undefined){
          resolve({'id': id, 'buffer': undefined});
        }else{
          resolve(undefined);
        }
      }
    );
  });
}


export function parseSamples(mapping, every = false){
  let key, sample,
    promises = [],
    type = typeString(mapping);

  every = typeString(every) === 'function' ? every : false;
  //console.log(type, mapping)
  if(type === 'object'){
    for(key in mapping){
      if(mapping.hasOwnProperty(key)){
        sample = mapping[key];
        if(checkIfBase64(sample)){
          promises.push(parseSample(base64ToBinary(sample), key, every));
        }else{
          promises.push(loadAndParseSample(sample, key, every));
        }
      }
    }
  }else if(type === 'array'){
    mapping.forEach(function(sample){
      if(checkIfBase64(sample)){
        promises.push(parseSample(sample, every));
      }else{
        promises.push(loadAndParseSample(sample, every));
      }
    });
  }

  return new Promise(function(resolve, reject){
    Promise.all(promises).then(
      function onFulfilled(values){
        if(type === 'object'){
          let mapping = {};
          values.forEach(function(value){
            mapping[value.id] = value.buffer;
          });
          //console.log(mapping);
          resolve(mapping);
        }else if(type === 'array'){
          resolve(values);
        }
      },
      function onRejected(e){
        reject(e);
      }
    );
  });
}


function checkIfBase64(data){
  let passed = true;
  try{
    atob(data);
  }catch(e){
    passed = false;
  }
  return passed;
}


// adapted version of https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js
function base64ToBinary(input){
  let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    bytes, uarray, buffer,
    lkey1, lkey2,
    chr1, chr2, chr3,
    enc1, enc2, enc3, enc4,
    i, j = 0;

  bytes = Math.ceil((3 * input.length) / 4.0);
  buffer = new ArrayBuffer(bytes);
  uarray = new Uint8Array(buffer);

  lkey1 = keyStr.indexOf(input.charAt(input.length-1));
  lkey2 = keyStr.indexOf(input.charAt(input.length-1));
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



export function error(){
  if(config.get('debugLevel') >= 1){
    //console.error(...arguments);
    //console.trace();
    console.groupCollapsed('ERROR:', ...arguments);
    console.trace();
    console.groupEnd();
  }
}

export function warn(){
  if(config.get('debugLevel') >= 2){
    //console.warn(...arguments);
    //console.trace();
    console.groupCollapsed('WARNING:', ...arguments);
    console.trace();
    console.groupEnd();
  }
}

export function info(){
  if(config.get('debugLevel') >= 3){
    //console.info(...arguments);
    //console.trace('INFO', ...arguments);
    console.groupCollapsed('INFO:', ...arguments);
    console.trace();
    console.groupEnd();
  }
}

export function log(){
  if(config.get('debugLevel') >= 4){
    //console.log(...arguments);
    //console.trace('LOG', ...arguments);
    console.groupCollapsed('LOG:', ...arguments);
    console.trace();
    console.groupEnd();
  }
}


export function getNiceTime(millis){
  let h, m, s, ms,
      seconds,
      timeAsString = '';

  seconds = millis/1000; // → millis to seconds
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


export function createState(state = 'clean'){
  return {
    part: state,
    track: state,
    song: state
  };
}
