import {initAudio} from './init_audio'
import {initMIDI} from './init_midi'

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


export function init(settings = {}): void{

  // load settings.instruments (array or object)
  // load settings.midifiles (array or object)
  /*

    qambi.init({
      instruments: ['../instruments/piano', '../instruments/violin'],
      midifiles: ['../midi/mozart.mid']
    })
    .then((loaded) => {
      let [piano, violin] = loaded.instruments
      let [mozart] = loaded.midifiles
    })

  */

  return new Promise((resolve, reject) => {

    Promise.all([initAudio(), initMIDI()])
    .then(
    (data) => {
      // parseAudio
      let dataAudio = data[0]

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
