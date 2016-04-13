/*
  Sets up the basic audio routing, tests which audio formats are supported and parses the samples for the metronome ticks.
*/

'use strict';

import {context} from './init';
import {parseSamples} from './util';
import samples from './samples';


let
  data = {},
  // context,

  source,
  gainNode,
  compressor;

const
  compressorParams = ['threshold', 'knee', 'ratio', 'reduction', 'attack', 'release']


export function initAudio(){

  //context = ctx
  return new Promise((resolve, reject) => {
    //console.log(context)
    if(context.createGainNode === undefined){
      context.createGainNode = context.createGain;
    }
    // check for older implementations of WebAudio
    source = context.createBufferSource();
    data.legacy = false;
    if(source.start === undefined){
      data.legacy = true;
    }

    // set up the elementary audio nodes
    compressor = context.createDynamicsCompressor();
    compressor.connect(context.destination);
    gainNode = context.createGainNode();
    gainNode.connect(context.destination);
    gainNode.gain.value = 0.5;

    data.masterGainNode = gainNode;
    data.masterCompressor = compressor;

    parseSamples({
      'ogg': samples.emptyOgg,
      'mp3': samples.emptyMp3,
      'lowtick': samples.lowtick,
      'hightick': samples.hightick
    }).then(
      function onFulfilled(buffers){
        data.ogg = buffers.ogg !== undefined;
        data.mp3 = buffers.mp3 !== undefined;
        data.lowtick = buffers.lowtick;
        data.hightick = buffers.hightick;
        if(data.ogg === false && data.mp3 === false){
          reject('No support for ogg nor mp3!');
        }else{
          resolve(data);
        }
      },
      function onRejected(){
        reject('Something went wrong while initializing Audio');
      }
    );
  });

}


data.setMasterVolume = function(value = 0.5){
  if(value > 1){
    info('maximal volume is 1.0, volume is set to 1.0');
  }
  value = value < 0 ? 0 : value > 1 ? 1 : value;
  gainNode.gain.value = value;
};


data.getMasterVolume = function(){
  return gainNode.gain.value;
};


data.getCompressionReduction = function(){
  //console.log(compressor);
  return compressor.reduction.value;
};


data.enableMasterCompressor = function(flag){
  if(flag){
    gainNode.disconnect(0);
    gainNode.connect(compressor);
    compressor.disconnect(0);
    compressor.connect(context.destination);
  }else{
    compressor.disconnect(0);
    gainNode.disconnect(0);
    gainNode.connect(context.destination);
  }
};


data.configureMasterCompressor = function(cfg){
  /*
      readonly attribute AudioParam threshold; // in Decibels
      readonly attribute AudioParam knee; // in Decibels
      readonly attribute AudioParam ratio; // unit-less
      readonly attribute AudioParam reduction; // in Decibels
      readonly attribute AudioParam attack; // in Seconds
      readonly attribute AudioParam release; // in Seconds
  */
  let i, param;
  for(i = compressorParams.length; i >= 0; i--){
      param = compressorParams[i];
      if(cfg[param] !== undefined){
          compressor[param].value = cfg[param];
      }
  }
};


data.getAudioContext = function(){
  return context;
};


data.getTime = function(){
  return context.currentTime;
};


export default initAudio;


