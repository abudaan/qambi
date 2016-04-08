import {
  createMIDIEvent,
  moveMIDIEvent,
  moveMIDIEventTo,
} from './midi_event'
import{
  createMIDINote
} from './midi_note'


document.addEventListener('DOMContentLoaded', function(){

  let button = document.getElementById('next')
  let buttonClicked = 0
  let noteon, noteoff, note
  button.addEventListener('click', function(){
    switch(buttonClicked){
      case 0:
        noteon = createMIDIEvent(120, 144, 60, 100)
        break;
      case 1:
        noteoff = createMIDIEvent(240, 128, 60, 100)
        break;
      case 2:
        note = createMIDINote(noteon, noteoff)
        break;
      case 3:
        moveMIDIEvent(noteon, -100)
        break;
      case 4:
        moveMIDIEventTo(noteoff, 260)
        break;
      default:
    }
    buttonClicked++
  })
})