
import fetch from 'isomorphic-fetch'
import {context} from './init_audio'


const
  mPow = Math.pow,
  mRound = Math.round,
  mFloor = Math.floor,
  mRandom = Math.random


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


export function parseSample(sample, id, every){
  return new Promise(function(resolve, reject){
    try{
      context.decodeAudioData(sample,
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
  let executor = function(resolve, reject){

    fetch(url).then(
      function(response){
        if(response.ok){
          response.blob().then(function(data){
            parseSample(data, id, every).then(resolve, reject);
          })
        }else{
          if(typeof id !== 'undefined'){
            resolve({'id': id, 'buffer': undefined});
          }else{
            resolve(undefined);
          }
        }
      }
    );
  }
  return new Promise(executor);
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
        //console.log(checkIfBase64(sample))
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

export function poepen(){
  console.log(context)
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
