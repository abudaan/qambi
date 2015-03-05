'use strict';

import {addEventListener, removeEventListener, dispatchEvent} from './song_add_eventlistener';
import getConfig from './config';


let songId = 0,
  config = getConfig();


class Song{

  constructor(data){
    this.id = 'S' + songId++ + new Date().getTime();
    this.data = data;
  }

  // add samples to the instrument after it has been created, this allows you to jit load the samples of an instrument
  addSamples(samples){
    //console.log('added', samples);
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