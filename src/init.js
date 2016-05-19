import qambi from './qambi'
import {Song} from './song'
import {Instrument} from './instrument'
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


function loadInstrument(data){
  let instrument = new Instrument()
  return new Promise((resolve, reject) => {
    instrument.parseSampleData(data)
    .then(resolve(instrument))
  })
}

export function init(settings =  null): void{

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

  let promises = []
  let loadKeys = Object.keys(settings)

  if(settings !== null){
    for(let key of loadKeys){
      let data = settings[key]

      if(data.type === 'Song'){
        promises.push(Song.fromMIDIFileAsync(data.url))
      }else if(data.type === 'Instrument'){
        promises.push(loadInstrument(data))
      }
    }
  }


  return new Promise((resolve, reject) => {

    Promise.all([initAudio(), initMIDI()])
    .then(
    (data) => {
      // parseAudio
      let dataAudio = data[0]

      // parseMIDI
      let dataMidi = data[1]

      let result = {
        legacy: dataAudio.legacy,
        mp3: dataAudio.mp3,
        ogg: dataAudio.ogg,
        midi: dataMidi.midi,
        webmidi: dataMidi.webmidi,
      }
      console.log('qambi', qambi.version)

      if(promises.length > 0){
        Promise.all(promises)
        .then(loadedData => {
          // add the loaded data by their keys to the result object
          loadedData.forEach((loaded, i) => {
            result[loadKeys[i]] = loaded
          })
          resolve(result)
        })
      }else{
        resolve(result)
      }
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
