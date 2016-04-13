/*
  Sets up the basic audio routing, tests which audio formats are supported and parses the samples for the metronome ticks.
*/


import samples from './samples'
import {parseSamples} from './util'


let
  data = {},
  context,
  masterGain,
  compressor,
  initialized = false


export function initAudio(){

  if(context.createGainNode === undefined){
    context.createGainNode = context.createGain
  }
  // check for older implementations of WebAudio
  let source = context.createBufferSource()
  data.legacy = false
  if(source.start === undefined){
    data.legacy = true
  }

  // set up the elementary audio nodes
  compressor = context.createDynamicsCompressor()
  compressor.connect(context.destination)
  masterGain = context.createGainNode()
  masterGain.connect(context.destination)
  masterGain.gain.value = 0.5
  initialized = true

  return new Promise((resolve, reject) => {

    parseSamples(samples).then(
      function onFulfilled(buffers){
        //console.log(buffers)
        data.ogg = buffers.emptyOgg !== undefined
        data.mp3 = buffers.emptyMp3 !== undefined
        data.lowtick = buffers.lowtick
        data.hightick = buffers.hightick
        if(data.ogg === false && data.mp3 === false){
          reject('No support for ogg nor mp3!')
        }else{
          resolve(data)
        }
      },
      function onRejected(){
        reject('Something went wrong while initializing Audio')
      }
    )
  })
}


let getAudioContext = function(){
  if(typeof context === 'undefined'){
    if(typeof window === 'object'){
      window.AudioContext = (window.AudioContext || window.webkitAudioContext)
      context = new window.AudioContext
    }else{
      //@TODO: create dummy AudioContext for use in node, see: https://www.npmjs.com/package/audio-context
      context = {
        createGain: function(){
          return {
            gain: 1
          }
        },
        createOscillator: function(){},
      }
    }
  }

  getAudioContext = function(){
    return context
  }
  return context
}


let setMasterVolume = function(value: number = 0.5): void{
  if(initialized === false){
    console.error('please call qambi.init() first')
  }else {
    setMasterVolume = function(value: number = 0.5){
      if(value > 1){
        console.info('maximal volume is 1.0, volume is set to 1.0');
      }
      value = value < 0 ? 0 : value > 1 ? 1 : value;
      masterGain.gain.value = value;
    }
    setMasterVolume(value)
  }
}


let getMasterVolume = function(): void{
  if(initialized === false){
    console.error('please call qambi.init() first')
  }else {
    getMasterVolume = function(){
      return masterGain.gain.value
    }
    return getMasterVolume()
  }
}


let getCompressionReduction = function(): void{
  if(initialized === false){
    console.error('please call qambi.init() first')
  }else {
    getCompressionReduction = function(){
      return compressor.reduction.value
    }
    return getCompressionReduction()
  }
}


let enableMasterCompressor = function(): void{
  if(initialized === false){
    console.error('please call qambi.init() first')
  }else {
    enableMasterCompressor = function(flag: boolean){
      if(flag){
        masterGain.disconnect(0);
        masterGain.connect(compressor);
        compressor.disconnect(0);
        compressor.connect(context.destination);
      }else{
        compressor.disconnect(0);
        masterGain.disconnect(0);
        masterGain.connect(context.destination);
      }
    }
    enableMasterCompressor()
  }
}


let configureMasterCompressor = function(cfg): void{
  /*
      readonly attribute AudioParam attack; // in Seconds
      readonly attribute AudioParam knee; // in Decibels
      readonly attribute AudioParam ratio; // unit-less
      readonly attribute AudioParam reduction; // in Decibels
      readonly attribute AudioParam release; // in Seconds
      readonly attribute AudioParam threshold; // in Decibels

      @see: http://webaudio.github.io/web-audio-api/#the-dynamicscompressornode-interface
  */
  if(initialized === false){
    console.error('please call qambi.init() first')
  }else {
    configureMasterCompressor = function(cfg: {}){
      ({
        attack: compressor.attack = 0.003,
        knee: compressor.knee = 30,
        ratio: compressor.ratio = 12,
        reduction: compressor.reduction = 0,
        release: compressor.release = 0.250,
        threshold: compressor.threshold = -24,
      } = cfg)
    }
    configureMasterCompressor(cfg)
  }
}

export {getAudioContext, setMasterVolume, getMasterVolume, getCompressionReduction, enableMasterCompressor, configureMasterCompressor}
