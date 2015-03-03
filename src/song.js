'use strict';

import {addEventListener, removeEventListener, dispatchEvent} from './song_addeventlistener';

let songId = 0;

class Song{

  constructor(config){
    this.id = 'S' + songId++ + new Date().getTime();
    this.config = config;
  }

  // add samples to the instrument after it has been created, this allows you to jit load the samples of an instrument
  addSamples(samples){
    console.log('added', samples);
  }

  stop(){
    dispatchEvent('stop');
  }

  play(){
    dispatchEvent('play');
  }
}

Song.prototype.addEventListener = addEventListener;
Song.prototype.removeEventListener = removeEventListener;
Song.prototype.dispatchEvent = dispatchEvent;

export default Song;