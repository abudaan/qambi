import {initAudio} from './init_audio'
import {initMIDI} from './init_midi'
import {getStore} from './create_store'
import {STORE_SAMPLES} from './action_types'

const store = getStore()

export let getUserMedia = (() => {
  if(typeof navigator !== 'undefined'){
    return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia
  }
  return function(){
    console.warn('getUserMedia is not available')
  }
})()


export let requestAnimationFrame = (() => {
  if(typeof navigator !== 'undefined'){
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame
  }
  return function(){
    console.warn('requestAnimationFrame is not available')
  }
})()


export let Blob = (() => {
  if(typeof navigator !== 'undefined'){
    return window.Blob || window.webkitBlob
  }
  return function(){
    console.warn('Blob is not available')
  }
})()


export function init(): void{
  return new Promise((resolve, reject) => {

    Promise.all([initAudio(), initMIDI()])
    .then(
    (data) => {
      // parseAudio
      let dataAudio = data[0]

      store.dispatch({
        type: STORE_SAMPLES,
        payload: {
          lowTick: dataAudio.lowtick,
          highTick: dataAudio.hightick,
        }
      })

      // parseMIDI
      let dataMidi = data[1]

      resolve({
        legacy: dataAudio.legacy,
        mp3: dataAudio.mp3,
        ogg: dataAudio.ogg,
        midi: dataMidi.midi,
        webmidi: dataMidi.webmidi,
      })
    },
    (error) => {
      reject(error)
    })
  })
}
