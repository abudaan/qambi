'use strict';

import sequencer from './sequencer';
import {MIDIEvent} from './midi_event';

export function somethingVeryUseful(arg){
  var e = new MIDIEvent(0, 128, 60, 100);
  console.log('new feature:', arg, e);
}

