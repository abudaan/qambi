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