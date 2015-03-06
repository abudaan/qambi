'use strict';

import {addEventListener, removeEventListener, dispatchEvent} from './song_add_eventlistener';
import {log, info, warn, error, typeString} from './util';
import getConfig from './config';


let songId = 0,
  config = getConfig();


class Song{

  constructor(data){
    this.id = 'S' + songId++ + new Date().getTime();
    this.data = data;

    // log('log');
    // info('info');
    // warn('warn');
    // error('error');
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