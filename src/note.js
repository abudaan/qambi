/*
  Adds a function to create a note object that contains information about a musical note:
    - name, e.g. 'C'
    - octave,  -1 - 9
    - fullName: 'C1'
    - frequency: 234.16, based on the basic pitch
    - number: 60 midi note number

  Adds several utility methods organised around the note object
*/

'use strict';

import {typeString} from './util';

let
  errorMsg,
  warningMsg,
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
  - noteNumber and notename mode: 60, 'sharp'
  - noteName: 'C#4'
  - name and octave: 'C#', 4
  - note name, octave, note name mode: 'D', 4, 'sharp'
  - data object:
    {
      name: 'C',
      octave: 4
    }
    or
    {
      frequency: 234.16
    }
*/

export function createNote(...args){
  let
    numArgs = args.length,
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

  errorMsg = '';
  warningMsg = '';

  // argument: note number
  if(numArgs === 1 && type0 === 'number'){
    if(arg0 < 0 || arg0 > 127){
      errorMsg = 'please provide a note number >= 0 and <= 127 ' +  arg0;
    }else{
      noteNumber = arg0;
      data = _getNoteName(noteNumber);
      noteName = data[0];
      octave = data[1];
    }


  // arguments: full note name
  }else if(numArgs === 1 && type0 === 'string'){
    data = _checkNoteName(arg0);
    if(errorMsg === ''){
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName, octave);
    }

  // arguments: note name, octave
  }else if(numArgs === 2 && type0 === 'string' && type1 === 'number'){
    data = _checkNoteName(arg0, arg1);
    if(errorMsg === ''){
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName, octave);
    }

  // arguments: full note name, note name mode -> for converting between note name modes
  }else if(numArgs === 2 && type0 === 'string' && type1 === 'string'){
    data = _checkNoteName(arg0);
    if(errorMsg === ''){
      noteNameMode = _checkNoteNameMode(arg1);
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName, octave);
    }


  // arguments: note number, note name mode
  }else if(numArgs === 2 && typeString(arg0) === 'number' && typeString(arg1) === 'string'){
    if(arg0 < 0 || arg0 > 127){
      errorMsg = 'please provide a note number >= 0 and <= 127 ' + arg0;
    }else{
      noteNameMode = _checkNoteNameMode(arg1);
      noteNumber = arg0;
      data = _getNoteName(noteNumber, noteNameMode);
      noteName = data[0];
      octave = data[1];
    }


  // arguments: note name, octave, note name mode
  }else if(numArgs === 3 && type0 === 'string' && type1 === 'number' && type2 === 'string'){
    data = _checkNoteName(arg0, arg1);
    if(errorMsg === ''){
      noteNameMode = _checkNoteNameMode(arg2);
      noteName = data[0];
      octave = data[1];
      noteNumber = _getNoteNumber(noteName,octave);
    }

  }else{
    errorMsg = 'wrong arguments, please consult documentation';
  }

  if(errorMsg){
    console.error(errorMsg);
    return false;
  }

  if(warningMsg){
    console.warn(warningMsg);
  }

  let note = {
    name: noteName,
    octave: octave,
    fullName: noteName + octave,
    number: noteNumber,
    frequency: _getFrequency(noteNumber),
    blackKey: _isBlackKey(noteNumber)
  }
  Object.freeze(note);
  return note;
}


//function _getNoteName(number, mode = config.get('noteNameMode')) {
function _getNoteName(number, mode = 'sharp') {
  //let octave = Math.floor((number / 12) - 2), // → in Cubase central C = C3 instead of C4
  let octave = floor((number / 12) - 1);
  let noteName = noteNames[mode][number % 12];
  return [noteName, octave];
}


function _getNoteNumber(name, octave) {
  let keys = Object.keys(noteNames);
  let index;

  for(let key of keys){
    let mode = noteNames[key];
    index = mode.findIndex(x => x === name);
    if(index !== -1){
      break;
    }
  }

  //number = (index + 12) + (octave * 12) + 12; // → in Cubase central C = C3 instead of C4
  let number = (index + 12) + (octave * 12);// → midi standard + scientific naming, see: http://en.wikipedia.org/wiki/Middle_C and http://en.wikipedia.org/wiki/Scientific_pitch_notation

  if(number < 0 || number > 127){
    errorMsg = 'please provide a note between C0 and G10';
    return;
  }
  return number;
}


function _getFrequency(number){
  //return config.get('pitch') * pow(2,(number - 69)/12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
  return 440 * pow(2,(number - 69)/12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
}


// TODO: calculate note from frequency
function _getPitch(hertz){
  //fm  =  2(m−69)/12(440 Hz).
}


function _checkNoteNameMode(mode){
  let keys = Object.keys(noteNames);
  let result = keys.find(x => x === mode) !== undefined;
  if(result === false){
    //mode = config.get('noteNameMode');
    mode = 'sharp';
    warningMsg = mode + ' is not a valid note name mode, using "' + mode + '" instead';
  }
  return mode;
}


function _checkNoteName(...args){
  let
    numArgs = args.length,
    arg0 = args[0],
    arg1 = args[1],
    char,
    name = '',
    octave = '';

  // extract octave from note name
  if(numArgs === 1){
    for(char of arg0){
      if(isNaN(char) && char !== '-'){
        name += char;
      }else{
        octave += char;
      }
    }
    if(octave === ''){
      octave = 0;
    }
  }else if(numArgs === 2){
    name = arg0;
    octave = arg1;
  }

  // check if note name is valid
  let keys = Object.keys(noteNames);
  let index = -1;

  for(let key of keys){
    let mode = noteNames[key];
    index = mode.findIndex(x => x === name);
    if(index !== -1){
      break;
    }
  }

  if(index === -1){
    errorMsg = arg0 + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb, followed by a number for the octave';
    return;
  }

  if(octave < -1 || octave > 9){
    errorMsg = 'please provide an octave between -1 and 9';
    return;
  }

  octave = parseInt(octave, 10);
  name = name.substring(0, 1).toUpperCase() + name.substring(1);

  //console.log(name,'|',octave);
  return [name, octave];
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
  return errorMsg;
}


export function getNoteName(...args){
  let note = createNote(...args);
  if(note){
    return note.name;
  }
  return false;
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


