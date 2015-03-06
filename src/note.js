'use strict';

import getConfig from './config';
import {log, info, warn, error, typeString} from './util';

let
  config = getConfig(),
  pow = Math.pow,
  floor = Math.floor;

const noteNames = {
  'sharp' : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  'flat' : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'enharmonic-sharp' : ['B#', 'C#', 'C##', 'D#', 'D##', 'E#', 'F#', 'F##', 'G#', 'G##', 'A#', 'A##'],
  'enharmonic-flat' : ['Dbb', 'Db', 'Ebb', 'Eb', 'Fb', 'Gbb', 'Gb', 'Abb', 'Ab', 'Bbb', 'Bb', 'Cb']
};


/*
  arguments
  - noteNumber: 60
  - noteNumber and notename mode: 60, sharp
  - noteName: 'C#4'
  - name and octave: 'C#', 4

  note {
  name: 'C',
  octave: 1,
  fullName: 'C1',
  frequency: 234.16,
  number: 60
  }
*/
export function createNote(...args){
  let
    numArgs = args.length,
    error,
    warn,
    data,
    octave,
    noteName,
    noteNumber,
    noteNameMode,
    arg0 = args[0],
    arg1 = args[1],
    arg2 = args[2],
    type0 = typeString(arg0),
    type1 = typeString(arg1),
    type2 = typeString(arg2);


  // argument: note number
  if(numArgs === 1 && type0 === 'number'){
    if(arg0 < 0 || arg0 > 127){
      error = 'please provide a note number >= 0 and <= 127 ' +  arg0;
    }else{
      noteNumber = arg0;
      data = _getNoteName(noteNumber);
      noteName = data[0];
      octave = data[1];
    }


  // arguments: full note name
  }else if(numArgs === 1 && type0 === 'string'){
    data = _checkNoteName(arg0);
    if(!data){
      error = arg0 + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb, followed by a number for the octave';
    }else{
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName, octave);
      if(!noteNumber){
        error = arg0 + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb, followed by a number for the octave';
      }else if(noteNumber < 0 || noteNumber > 127){
        error = 'please provide a note between C0 and G10';
      }
    }

  // arguments: note name, octave
  }else if(numArgs === 2 && type0 === 'string' && type1 === 'number'){
    data = _checkNoteName(arg0, arg1);
    if(!data){
      error = arg0 + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb';
    }else{
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName, octave);
      if(!noteNumber){
        error = noteName + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb';
      }else if(noteNumber < 0 || noteNumber > 127){
        error = 'please provide a note between C0 and G10';
      }
    }

  // arguments: full note name, note name mode -> for converting between note name modes
  }else if(numArgs === 2 && type0 === 'string' && type1 === 'string'){
    data = _checkNoteName(arg0);
    if(!data){
      error = arg0 + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb, followed by a number for the octave';
    }else{
      noteNameMode = _isNoteMode(arg1);
      if(!noteNameMode){
        noteNameMode = config.noteNameMode;
        warn = arg1 + ' is not a valid note name mode, using ' + noteNameMode;
      }
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName, octave);
      if(!noteNumber){
        error = noteName + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb, followed by a number for the octave';
      }else if(noteNumber < 0 || noteNumber > 127){
        error = 'please provide a note between C0 and G10';
      }
      noteName = _getNoteName(noteNumber, noteNameMode)[0];
    }


  // arguments: note number, note name mode
  }else if(numArgs === 2 && typeString(arg0) === 'number' && typeString(arg1) === 'string'){
    if(arg0 < 0 || arg0 > 127){
      error = 'please provide a note number >= 0 and <= 127 ' + arg0;
    }else{
      noteNameMode = _isNoteMode(arg1);
      if(!noteNameMode){
        noteNameMode = config.noteNameMode;
        warn = arg1 + ' is not a valid note name mode, using ' + noteNameMode;
      }
      noteNumber = arg0;
      data = _getNoteName(noteNumber, noteNameMode);
      noteName = data[0];
      octave = data[1];
      noteName = getNoteName(noteNumber,noteNameMode)[0];
    }


  // arguments: note name, octave, note name mode
  }else if(numArgs === 3 && type0 === 'string' && type1 === 'number' && type2 === 'string'){
    data = _checkNoteName(arg0, arg1);
    if(!data){
      error = arg0 + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb, followed by a number for the octave';
    }else{
      noteNameMode = _isNoteMode(arg2);
      if(!noteNameMode){
        noteNameMode = config.noteNameMode;
        warn = arg2 + ' is not a valid note name mode, using ' + noteNameMode;
      }
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName,octave);
      if(!noteNumber){
        error = noteName + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb, followed by a number for the octave';
      }else if(noteNumber < 0 || noteNumber > 127){
        error = 'please provide a note between C0 and G10';
      }
      noteName = _getNoteName(noteNumber,noteNameMode)[0];
    }
  }else{
    error = 'wrong arguments, please consult documentation';
  }

  if(error){
    console.error(error);
    return false;
  }

  if(warn){
    console.warn(warn);
  }

  return {
    name: noteName,
    octave: octave,
    fullName: noteName + octave,
    number: noteNumber,
    frequency: _getFrequency(noteNumber),
    blackKey: _isBlackKey(noteNumber)
  };

}


function _getNoteName(number, mode = config.noteNameMode) {
  //let octave = Math.floor((number / 12) - 2), // → in Cubase central C = C3 instead of C4
  let octave = floor((number / 12) - 1),
    noteName = noteNames[mode][number % 12];
  return [noteName, octave];
}


function _getNoteNumber(name, octave) {
  let keys = Object.keys(noteNames),
    index = -1, number;

  for(let key of keys){
    let mode = noteNames[key];
    index = mode.findIndex(x => x === name);
    if(index !== -1){
      break;
    }
  }

  if(index === -1) {
    return false;
  }

  //number = (index + 12) + (octave * 12) + 12; // → in Cubase central C = C3 instead of C4
  number = (index + 12) + (octave * 12);// → midi standard + scientific naming, see: http://en.wikipedia.org/wiki/Middle_C and http://en.wikipedia.org/wiki/Scientific_pitch_notation
  return number;
}


function _getFrequency(number){
  return config.pitch * pow(2,(number - 69)/12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
}


// TODO: calculate note from frequency
function _getPitch(hertz){
  //fm  =  2(m−69)/12(440 Hz).
}


function _checkNoteName(...args){
  let
    numArgs = args.length,
    arg0 = args[0],
    arg1 = args[1],
    length,i,char,
    name,
    octave;


  if(numArgs === 1 && typeString(arg0) === 'string'){

    length = arg0.length;
    name = '';
    octave = '';

    for(i = 0; i < length; i++){
      char = arg0[i];
      if(isNaN(char) && char !== '-'){
        name += char;
      }else{
        octave += char;
      }
    }

    if(octave === ''){
      octave = 0;
    }

  }else if(numArgs === 2 && typeString(arg0) === 'string' && !isNaN(arg1)){

    name = arg0;
    octave = arg1;

  }else{
    return false;
  }

  octave = parseInt(octave,10);
  name = name.substring(0,1).toUpperCase() + name.substring(1);

  //console.log(name,'|',octave);
  return [name, octave];
}


function _isNoteMode(mode){
  let result = false;
  switch(mode){
    case 'sharp':
    case 'flat':
    case 'enharmonic-sharp':
    case 'enharmonic-flat':
      result = mode;
      break;
  }
  return result;
}


function _isBlackKey(noteNumber){
  let black;

  switch(true){
    case noteNumber % 12 === 1://C#
    case noteNumber % 12 === 3://D#
    case noteNumber % 12 === 6://F#
    case noteNumber % 12 === 8://G#
    case noteNumber % 12 === 10://A#
      black = true;
      break;
    default:
      black = false;
  }

  return black;
}




export function getNoteNumber(...args){
  let note = createNote(...args);
  if(note){
    return note.number;
  }
  return false;
}


export function getNoteName(...args){
  let note = createNote(...args);
  if(note){
    return note.name;
  }
  return false;
}


export function getNoteNameFromNoteNumber(number, mode){
  return getNoteName(number, mode);
}


export function getNoteOctave(...args){
  let note = createNote(...args);
  if(note){
    return note.octave;
  }
  return false;
}


export function getFullNoteName(...args){
  let note = createNote(...args);
  if(note){
    return note.fullName;
  }
  return false;
}


export function getFrequency(...args){
  let note = createNote(...args);
  if(note){
    return note.frequency;
  }
  return false;
}


export function isBlackKey(...args){
  let note = createNote(...args);
  if(note){
    return note.blackKey;
  }
  return false;
}


