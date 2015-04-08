'use strict';

import {log, info, warn, error} from './utils';
import {getNoteNumber} from './note';

class Instrument{

  constructor(){

  }

  processEvent(event){

  }

  /*
    @param noteId can be note name (C4) or note number (72)
    @param audio buffer
    @param config (optional)
      {
        s: [sustainStart, sustainEnd], // optional
        r: [releaseDuration, releaseEnvelope], // optional
        p: panPosition // optional
      }
  */
  addSampleData(noteId, audioBuffer, config){
    if(isNaN(noteId)){
      noteId = getNoteNumber(noteId);
      if(isNaN(number)){
        warn(number);
      }
    }
  }
}


export default function createInstrument(){
  return new Instrument(...arguments);
}