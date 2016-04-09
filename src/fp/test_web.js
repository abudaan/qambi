import {
  createMIDIEvent,
  moveMIDIEvent,
  moveMIDIEventTo,
} from './midi_event'
import{
  createMIDINote
} from './midi_note'
import{
  createSong
} from './song'
import{
  createTrack,
  addPart
} from './track'
import{
  createPart
} from './part'


document.addEventListener('DOMContentLoaded', function(){

  let button = document.getElementById('next')
  let buttonClicked = 0
  let noteon, noteoff, note, song, track, part1, part2

  song = createSong({playbackSpeed: 100, loop: true})
  track = createTrack({name: 'guitar', song})
  part1 = createPart({name: 'solo1', track})
  part2 = createPart({name: 'solo2', track})

  addPart(track, part1, part2)

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
