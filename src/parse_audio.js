import fetch from 'isomorphic-fetch'
import {context} from './init_audio'
import {typeString, checkIfBase64, base64ToBinary} from './util'
import {dispatchEvent} from './eventlistener'


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

        function onError(){
          console.log(`error decoding audiodata [ID: ${id}]`);
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
  /*
  setTimeout(() => {
    dispatchEvent({
      type: 'loading',
      data: url
    })
  }, 0)
  */
  dispatchEvent({
    type: 'loading',
    data: url
  })

  let executor = function(resolve){
    // console.log(url)
    fetch(url, {
      method: 'GET'
    }).then(
      function(response){
        if(response.ok){
          response.arrayBuffer().then(function(data){
            //console.log(id, data)
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


function getPromises(promises, sample, key, baseUrl, every){

  const getSample = function(){
    if(key !== 'release' && key !== 'info' && key !== 'sustain'){
      //console.log(key)
      if(sample instanceof ArrayBuffer){
        promises.push(decodeSample(sample, key, baseUrl, every))
      }else if(typeof sample === 'string'){
        if(checkIfBase64(sample)){
          promises.push(decodeSample(base64ToBinary(sample), key, baseUrl, every))
        }else{
          //console.log(baseUrl + sample)
          promises.push(loadAndParseSample(baseUrl + escape(sample), key, every))
        }
      }else if(typeof sample === 'object'){
        sample = sample.sample || sample.buffer || sample.base64 || sample.url
        getSample(promises, sample, key, baseUrl, every)
        //console.log(key, sample)
        //console.log(sample, promises.length)
      }
    }
  }

  getSample()
}


// only for internally use in qambi
export function parseSamples2(mapping, every = false){
  let type = typeString(mapping),
    promises = [],
    baseUrl = ''

  if(typeof mapping.baseUrl === 'string'){
    baseUrl = mapping.baseUrl
    delete mapping.baseUrl
  }

  //console.log(mapping, baseUrl)

  every = typeof every === 'function' ? every : false
  //console.log(type, mapping)
  if(type === 'object'){
    Object.keys(mapping).forEach(function(key){
      // if(isNaN(key) === false){
      //   key = parseInt(key, 10)
      // }
      let a = mapping[key]
      //console.log(key, a, typeString(a))
      if(typeString(a) === 'array'){
        a.forEach(map => {
          //console.log(map)
          getPromises(promises, map, key, baseUrl, every)
        })
      }else{
        getPromises(promises, a, key, baseUrl, every)
      }
    })
  }else if(type === 'array'){
    let key
    mapping.forEach(function(sample){
      // key is deliberately undefined
      getPromises(promises, sample, key, baseUrl, every)
    })
  }

  return new Promise(function(resolve){
    Promise.all(promises)
    .then((values) => {
      //console.log(type, values)
      if(type === 'object'){
        mapping = {}
        values.forEach(function(value){
          // support for multi layered instruments
          let map = mapping[value.id]
          let type = typeString(map)
          if(type !== 'undefined'){
            if(type === 'array'){
              map.push(value.buffer)
            }else{
              mapping[value.id] = [map, value.buffer]
            }
          }else{
            mapping[value.id] = value.buffer
          }
        })
        //console.log(mapping)
        resolve(mapping)
      }else if(type === 'array'){
        resolve(values);
      }
    })
  })
}


export function parseSamples(...data){
  if(data.length === 1 && typeString(data[0]) !== 'string'){
    //console.log(data[0])
    return parseSamples2(data[0])
  }
  return parseSamples2(data)
}
