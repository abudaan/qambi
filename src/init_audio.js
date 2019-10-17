/*
  Sets up the basic audio routing, tests which audio formats are supported and parses the samples for the metronome ticks.
*/

import samples from './samples'
import {parseSamples} from './parse_audio'

let data
let masterGain
let compressor
let initialized = false

export let context; // Creating Audio CTX here on load fails due to Chrome Policy... moved to function below ... init now in initAudio()
// dont konw about the implications...
//The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu
// Also dont like things dangeling around in Window ctx


function createAudioCtx() {
  //console.log('init AudioContext')
  let ctx
  if (typeof window === 'object') {
    let AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext !== 'undefined') {
      ctx = new AudioContext()
    }
  }
  if (typeof ctx === 'undefined') {
    //@TODO: create dummy AudioContext for use in node, see: https://www.npmjs.com/package/audio-context
    ctx = {
      createGain: function () {
        return {
          gain: 1
        }
      },
      createOscillator: function () {
      },
    }
  }
  return ctx
}


export function initAudio() {
  if(!context) {
    context = createAudioCtx();
  }
  if(typeof context.createGainNode === 'undefined'){
    context.createGainNode = context.createGain
  }
  // check for older implementations of WebAudio
  data = {}
  let source = context.createBufferSource()
  data.legacy = false
  if(typeof source.start === 'undefined'){
    data.legacy = true
  }

  // set up the elementary audio nodes
  compressor = context.createDynamicsCompressor()
  compressor.connect(context.destination)
  masterGain = context.createGain()
  masterGain.connect(context.destination)
  masterGain.gain.value = 0.5
  initialized = true

  return new Promise((resolve, reject) => {

    parseSamples(samples).then(
      function onFulfilled(buffers){
        //console.log(buffers)
        // data.ogg = typeof buffers.emptyOgg !== 'undefined'
        // data.mp3 = typeof buffers.emptyMp3 !== 'undefined'
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


let setMasterVolume = function(value: number = 0.5): void{
  if(initialized === false){
    console.warn('please call qambi.init() first')
  }else {
    setMasterVolume = function(value: number = 0.5){
      if(value > 1){
        console.info('maximal volume is 1.0, volume is set to 1.0');
      }
      value = value < 0 ? 0 : value > 1 ? 1 : value
      masterGain.gain.value = value;
    }
    setMasterVolume(value)
  }
}


let getMasterVolume = function(): void{
  if(initialized === false){
    console.warn('please call qambi.init() first')
  }else {
    getMasterVolume = function(){
      return masterGain.gain.value
    }
    return getMasterVolume()
  }
}


let getCompressionReduction = function(): void{
  if(initialized === false){
    console.warn('please call qambi.init() first')
  }else {
    getCompressionReduction = function(){
      return compressor.reduction.value
    }
    return getCompressionReduction()
  }
}


let enableMasterCompressor = function(): void{
  if(initialized === false){
    console.warn('please call qambi.init() first')
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
    console.warn('please call qambi.init() first')
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

export function getInitData(){
  return data
}

// this doesn't seem to be necessary anymore on iOS anymore
let unlockWebAudio = function(){
  let src = context.createOscillator()
  let gainNode = context.createGain()
  gainNode.gain.value = 0
  src.connect(gainNode)
  gainNode.connect(context.destination)
  if(typeof src.noteOn !== 'undefined'){
    src.start = src.noteOn
    src.stop = src.noteOff
  }
  src.start(0)
  src.stop(0.001)
  unlockWebAudio = function(){
    //console.log('already done')
  }
}

export {masterGain, unlockWebAudio, compressor as masterCompressor, setMasterVolume, getMasterVolume, getCompressionReduction, enableMasterCompressor, configureMasterCompressor}
