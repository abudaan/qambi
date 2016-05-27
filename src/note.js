import {noteNameMode, pitch} from './settings'

const pow = Math.pow
const floor = Math.floor
//const checkNoteName = /^[A-G]{1}(b{0,2}}|#{0,2})[\-]{0,1}[0-9]{1}$/
const regexCheckNoteName = /^[A-G]{1}(b|bb|#|##){0,1}$/
const regexCheckFullNoteName = /^[A-G]{1}(b|bb|#|##){0,1}(\-1|[0-9]{1})$/
const regexSplitFullName = /^([A-G]{1}(b|bb|#|##){0,1})(\-1|[0-9]{1})$/
const regexGetOctave = /(\-1|[0-9]{1})$/

const noteNames = {
  sharp: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'enharmonic-sharp': ['B#', 'C#', 'C##', 'D#', 'D##', 'E#', 'F#', 'F##', 'G#', 'G##', 'A#', 'A##'],
  'enharmonic-flat': ['Dbb', 'Db', 'Ebb', 'Eb', 'Fb', 'Gbb', 'Gb', 'Abb', 'Ab', 'Bbb', 'Bb', 'Cb']
};


/*
  settings = {
    name: 'C',
    octave: 4,
    fullName: 'C4',
    number: 60,
    frequency: 234.16 // not yet implemented
  }
*/
export function getNoteData(settings){
  let {
    fullName,
    name,
    octave,
    mode,
    number,
    frequency,
  } = settings

  if(
       typeof name !== 'string'
    && typeof fullName !== 'string'
    && typeof number !== 'number'
    && typeof frequency !== 'number'){
    return null
  }

  if(number < 0 || number > 127){
    console.log('please provide a note between 0 (C-1) and 127 (G9)')
    return null
  }

  mode = _checkNoteNameMode(mode)
  //console.log(mode)

  if(typeof number === 'number'){
    ({
      fullName,
      name,
      octave
    } = _getNoteName(number, mode))

  }else if(typeof name === 'string'){

    if(regexCheckNoteName.test(name)){
      fullName = `${name}${octave}`
      number = _getNoteNumber(name, octave)
    }else{
      console.log(`invalid name ${name}`)
      return null
    }

  }else if(typeof fullName === 'string'){

    if(regexCheckFullNoteName.test(fullName)){
      ({
        octave,
        name,
       } = _splitFullName(fullName))
      number = _getNoteNumber(name, octave)
    }else{
      console.log(`invalid fullname ${fullName}`)
      return null
    }
  }

  let data = {
    name,
    octave,
    fullName,
    number,
    frequency: _getFrequency(number),
    blackKey: _isBlackKey(number),
  }
  //console.log(data)
  return data
}


function _getNoteName(number, mode = noteNameMode) {
  //let octave = Math.floor((number / 12) - 2), // → in Cubase central C = C3 instead of C4
  let octave = floor((number / 12) - 1)
  let name = noteNames[mode][number % 12]
  return {
    fullName: `${name}${octave}`,
    name,
    octave,
  }
}


function _getOctave(fullName){
  return parseInt(fullName.match(regexGetOctave)[0], 10)
}


function _splitFullName(fullName){
  let octave = _getOctave(fullName)
  return{
    octave,
    name: fullName.replace(octave, '')
  }
}


function _getNoteNumber(name, octave) {
  let keys = Object.keys(noteNames)
  let index

  for(let key of keys){
    let mode = noteNames[key]
    index = mode.findIndex(x => x === name)
    if(index !== -1){
      break
    }
  }

  //number = (index + 12) + (octave * 12) + 12 // → in Cubase central C = C3 instead of C4
  let number = (index + 12) + (octave * 12)// → midi standard + scientific naming, see: http://en.wikipedia.org/wiki/Middle_C and http://en.wikipedia.org/wiki/Scientific_pitch_notation

  if(number < 0 || number > 127){
    console.log('please provide a note between 0 (C-1) and 127 (G9)')
    return -1
  }
  return number
}


function _getFrequency(number){
  return pitch * pow(2, (number - 69) / 12) // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
}


//@TODO: calculate note from frequency
function _getPitch(hertz){
  //fm  =  2(m−69)/12(440 Hz).
}


function _checkNoteNameMode(mode){
  let keys = Object.keys(noteNames)
  let result = keys.includes(mode)
  //console.log(result)
  if(result === false){
    if(typeof mode !== 'undefined'){
      console.log(`${mode} is not a valid note name mode, using "${noteNameMode}" instead`)
    }
    mode = noteNameMode
  }
  return mode
}


function _isBlackKey(noteNumber){
  let black

  switch(true){
    case noteNumber % 12 === 1://C#
    case noteNumber % 12 === 3://D#
    case noteNumber % 12 === 6://F#
    case noteNumber % 12 === 8://G#
    case noteNumber % 12 === 10://A#
      black = true
      break;
    default:
      black = false
  }

  return black
}
