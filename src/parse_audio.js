import {context} from './init_audio'
import {typeString, checkIfBase64, base64ToBinary} from './util'
import fetch from 'isomorphic-fetch'


export function decodeSample(sample, id, every){
  return new Promise(function(resolve){
    try{
      context.decodeAudioData(sample,

        function onSuccess(buffer){
          //console.log(id, buffer);
          if(typeof id !== 'undefined'){
            resolve({id, buffer})
            if(every){
              every({id, buffer})
            }
          }else{
            resolve(buffer);
            if(every){
              every(buffer);
            }
          }
        },

        function onError(e){
          console('error decoding audiodata', id, e);
          //reject(e); // don't use reject because we use this as a nested promise and we don't want the parent promise to reject
          if(typeof id !== 'undefined'){
            resolve({id})
          }else{
            resolve()
          }
        }
      )
    }catch(e){
      console.warn('error decoding audiodata', id, e)
      if(typeof id !== 'undefined'){
        resolve({id})
      }else{
        resolve()
      }
    }
  })
}


function loadAndParseSample(url, id, every){
  //console.log(id, url)
  let executor = function(resolve){
    fetch(escape(url), {
      method: 'GET'
    }).then(
      function(response){
        if(response.ok){
          response.arrayBuffer().then(function(data){
            //console.log(data)
            decodeSample(data, id, every).then(resolve)
          })
        }else if(typeof id !== 'undefined'){
          resolve({id})
        }else{
          resolve()
        }
      }
    )
  }
  return new Promise(executor)
}


function getPromises(promises, sample, key, every){

  const getSample = function(){

    if(sample instanceof ArrayBuffer){
      promises.push(decodeSample(sample, key, every))
    }else if(typeof sample === 'string'){
      if(checkIfBase64(sample)){
        promises.push(decodeSample(base64ToBinary(sample), key, every))
      }else{
        promises.push(loadAndParseSample(sample, key, every))
      }
    }else if(typeof sample === 'object'){
      sample = sample.sample || sample.buffer || sample.base64 || sample.url
      getSample(promises, sample, key, every)
      //console.log(sample, promises.length)
    }
  }

  getSample()
}


// only for internally use in qambi
export function parseSamples2(mapping, every = false){
  let type = typeString(mapping),
    promises = []

  every = typeof every === 'function' ? every : false
  //console.log(type, mapping)
  if(type === 'object'){
    Object.keys(mapping).forEach(function(key){
      //key = parseInt(key, 10)
      //console.log(key)
      getPromises(promises, mapping[key], key, every)
    })
  }else if(type === 'array'){
    let key
    mapping.forEach(function(sample){
      // key is deliberately undefined
      getPromises(promises, sample, key, every)
    })
  }

  return new Promise(function(resolve){
    Promise.all(promises)
    .then((values) => {
      //console.log(type)
      if(type === 'object'){
        mapping = {}
        values.forEach(function(value){
          mapping[value.id] = value.buffer
        })
        resolve(mapping);
      }else if(type === 'array'){
        resolve(values);
      }
    })
  })
}


export function parseSamples(...data){
  if(data.length === 1 && typeString(data[0]) !== 'string'){
    return parseSamples2(data[0])
  }
  return parseSamples2(data)
}
