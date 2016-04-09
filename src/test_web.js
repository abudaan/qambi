
import qambi, {
  createMIDIEvent,
  moveMIDIEvent,
  moveMIDIEventTo,
  createMIDINote,
  createSong,
  addTracks,
  createTrack,
  addParts,
  createPart,
  addMIDIEvents,
  updateSong,
  startSong,
  stopSong,
} from './qambi'

console.log(qambi.version)
qambi.log('functions')

document.addEventListener('DOMContentLoaded', function(){

  let button = document.getElementById('next')
  let buttonClicked = 0
  let noteon, noteoff, note, song, track, part1, part2

  song = createSong({name: 'My First Song', playbackSpeed: 100, loop: true, bpm: 90})
  track = createTrack({name: 'guitar', song})
  part1 = createPart({name: 'solo1', track})
  part2 = createPart({name: 'solo2', track})
  noteon = createMIDIEvent(120, 144, 60, 100)
  noteoff = createMIDIEvent(240, 128, 60, 0)

  note = createMIDINote(noteon, noteoff)

  addMIDIEvents(part1, noteon, noteoff, 'beer', 'konijn')
  addParts(track, part1, part2)
  addTracks(song, track)
  updateSong(song)
  startSong(song)

  setTimeout(function(){
    stopSong(song)
  }, 1000)

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
