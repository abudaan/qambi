
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

  let button = document.getElementById('start')
  let noteon, noteoff, note, song, track, part1, part2

  song = createSong({name: 'My First Song', playbackSpeed: 100, loop: true, bpm: 90})
  track = createTrack({name: 'guitar', song})
  part1 = createPart({name: 'solo1', track})
  part2 = createPart({name: 'solo2', track})
  noteon = createMIDIEvent(120, 144, 60, 100)
  noteoff = createMIDIEvent(240, 128, 60, 0)

  note = createMIDINote(noteon, noteoff)

  addMIDIEvents(part1, noteon, noteoff, createMIDIEvent(600, 144, 67, 10))
  addParts(track, part1, part2)
  addTracks(song, track)
  updateSong(song)


  //startSong(song)
  // let song2 = createSong()

  // setTimeout(function(){
  //   startSong(song2, 5000)
  // }, 1000)

//   setTimeout(function(){
//     stopSong(song)
// //    stopSong(song2)
//   }, 200)

  button.addEventListener('click', function(){
    startSong(song)
  })
})
