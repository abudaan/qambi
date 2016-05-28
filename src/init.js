import qambi from './qambi'
import {Song} from './song'
import {Sampler} from './sampler'
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


export let rAF = (() => {
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


function loadInstrument(data){
  let sampler = new Sampler()
  return new Promise((resolve, reject) => {
    sampler.parseSampleData(data)
    .then(() => resolve(sampler))
  })
}

export function init(settings = null): void{

  // load settings.instruments (array or object)
  // load settings.midifiles (array or object)
  /*

  qambi.init({
    song: {
      type: 'Song',
      url: '../data/minute_waltz.mid'
    },
    piano: {
      type: 'Instrument',
      url: '../../instruments/electric-piano.json'
    }
  })

  qambi.init({
    instruments: ['../instruments/piano', '../instruments/violin'],
    midifiles: ['../midi/mozart.mid']
  })
  .then((loaded) => {
    let [piano, violin] = loaded.instruments
    let [mozart] = loaded.midifiles
  })

  */

  let promises = [initAudio(), initMIDI()]
  let loadKeys

  if(settings !== null){
    loadKeys = Object.keys(settings)
    for(let key of loadKeys){
      let data = settings[key]

      if(data.type === 'Song'){
        promises.push(Song.fromMIDIFile(data.url))
      }else if(data.type === 'Instrument'){
        promises.push(loadInstrument(data))
      }
    }
  }


  return new Promise((resolve, reject) => {

    Promise.all(promises)
    .then(
    (result) => {

      let returnObj = {}

      result.forEach((data, i) => {
        if(i === 0){
          // parseAudio
          returnObj.legacy = data.legacy
          returnObj.mp3 = data.mp3
          returnObj.ogg = data.ogg
        }else if(i === 1){
          // parseMIDI
          returnObj.midi = data.midi
          returnObj.webmidi = data.webmidi
        }else{
          // Instruments, samples or MIDI files that got loaded during initialization
          result[loadKeys[i - 2]] = data
        }
      })

      console.log('qambi', qambi.version)
      resolve(result)
    },
    (error) => {
      reject(error)
    })
  })


/*
  Promise.all([initAudio(), initMIDI()])
  .then(
  (data) => {
    // parseAudio
    let dataAudio = data[0]

    // parseMIDI
    let dataMidi = data[1]

    callback({
      legacy: dataAudio.legacy,
      mp3: dataAudio.mp3,
      ogg: dataAudio.ogg,
      midi: dataMidi.midi,
      webmidi: dataMidi.webmidi,
    })
  },
  (error) => {
    callback(error)
  })
*/
}

