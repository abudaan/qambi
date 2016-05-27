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

import {typeString} from './util'
import {noteNameMode} from './settings'

const pow = Math.pow
const floor = Math.floor
//const checkNoteName = /^[A-G]{1}(b{0,2}}|#{0,2})[\-]{0,1}[0-9]{1}$/
const checkNoteName = /^[A-G]{1}(b|bb|#|##)[\-]{0,1}$/
const checkFullNoteName = /^[A-G]{1}(b|bb|#|##){0,1}(\-1|[0-9]{1})$/
const regexGetOctave = /(\-1|[0-9]{1})$/

const noteNames = {
  sharp : ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  flat : ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'enharmonic-sharp': ['B#', 'C#', 'C##', 'D#', 'D##', 'E#', 'F#', 'F##', 'G#', 'G##', 'A#', 'A##'],
  'enharmonic-flat': ['Dbb', 'Db', 'Ebb', 'Eb', 'Fb', 'Gbb', 'Gb', 'Abb', 'Ab', 'Bbb', 'Bb', 'Cb']
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

export function getNoteData(settings){
  let {
    fullName,
    noteName,
    octave,
    mode: mode = noteNameMode,
    noteNumber,
    frequency,
  } = settings

  if(
       typeof fullName !== 'string'
    && typeof noteName !== 'string'
    && typeof noteNumber !== 'number'
    && typeof frequency !== 'number'){
    return
  }

  let tmp

  if(noteNumber){
    ({
      fullName,
      noteName,
      octave
    } = _getNoteName(noteNumber, mode))
  }else{

    if(checkFullNoteName.test(fullName)){
      octave = _getOctave(fullName)
    }
  }


  let data = {
    name: noteName,
    octave: octave,
    fullName: noteName + octave,
    number: noteNumber,
    frequency: _getFrequency(noteNumber),
    blackKey: _isBlackKey(noteNumber)
  }
  console.log(data)
  //Object.freeze(data);
  return data
}


//function _getNoteName(number, mode = config.get('noteNameMode')) {
function _getNoteName(number, mode = 'sharp') {
  //let octave = Math.floor((number / 12) - 2), // → in Cubase central C = C3 instead of C4
  let octave = floor((number / 12) - 1);
  let noteName = noteNames[mode][number % 12];
  return {
    fullName: `${noteName}${octave}`,
    noteName,
    octave,
  }
}


function _getOctave(fullName){
  return parseInt(fullName.match(regexGetOctave)[0])
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
    errorMsg = 'please provide a note between C-1 and G9';
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
