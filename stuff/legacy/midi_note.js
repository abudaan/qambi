'use strict';


import {log, info, warn, error} from './util';
import {MIDIEvent} from './midi_event';
import sequencer from './sequencer.js';

let
  midiNoteId = 0;


export class MIDINote{
  constructor(noteOn, noteOff){
    if(noteOn instanceof MIDIEvent){
      this.noteOn = noteOn;
      noteOn.midiNote = this;
    }

    if(noteOff instanceof MIDIEvent){
      this.noteOff = noteOff;
      noteOff.midiNote = this;
      this.endless = false;
      this.durationTicks = noteOff.ticks - noteOn.ticks;
      this.durationMillis = noteOff.millis - noteOn.millis;
    }else{
      this.endless = true;
    }

    this.id = 'N' + midiNoteId++ + Date.now();
    this.note = noteOn.note;
    this.number = noteOn.noteNumber;
    this.ticks = noteOn.ticks;
    this.pitch = noteOn.data1;
    this.velocity = noteOn.velocity;
    this.name = noteOn.noteName;
    this.type = sequencer.MIDI_NOTE;
  }


  addNoteOff(noteOff){
    if(noteOff.data1 !==  noteOn.data1){
      warn('noteOn and noteOff must have the same note number');
      return;
    }
    if(this.noteOff !== undefined){
      log(noteOff.ticks, noteOff.noteNumber, this.id, 'override note off event');
      this.noteOff.midiNote = undefined;
    }
    var noteOn = this.noteOn;
    noteOff.midiNote = this;
    this.endless = false;
    this.noteOff = noteOff;
    this.durationTicks = noteOff.ticks - noteOn.ticks;
    this.durationMillis = noteOff.millis - noteOn.millis;
  }


  setPitch(pitch){
    if(pitch < 0 || pitch > 127){
      return;
    }
    this.noteOn.setPitch(pitch);
    if(this.endless === false){
      this.noteOff.setPitch(pitch);
    }
    this.number = this.noteOn.noteNumber;
    this.name = this.noteOn.noteName;
    this.pitch = pitch;
  }


  mute(flag){
    if(flag !== undefined){
      this.mute = flag === true ? true : false;
    }else{
      this.mute = !this.mute;
    }
  }
}


export function createMIDINote(noteOn, noteOff){
  return new MIDINote(noteOn, noteOff);
}