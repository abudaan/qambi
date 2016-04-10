
import fetch from 'isomorphic-fetch'
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
  parseMIDIFile,
  songFromMIDIFile,
} from './qambi'

console.log(qambi.version)
qambi.log('functions')

document.addEventListener('DOMContentLoaded', function(){

  let button = document.getElementById('start')
  button.disabled = true

  let test = 1
  let noteon, noteoff, note, songId, track, part1, part2

  if(test === 1){

    songId = createSong({name: 'My First Song', playbackSpeed: 100, loop: true, bpm: 90})
    track = createTrack({name: 'guitar', songId})
    part1 = createPart({name: 'solo1', track})
    part2 = createPart({name: 'solo2', track})
    noteon = createMIDIEvent(0, 144, 60, 100)
    noteoff = createMIDIEvent(240, 128, 60, 0)

    //note = createMIDINote(noteon, noteoff)

    addMIDIEvents(part1, noteon, noteoff)
/*
    let events = []
    let ticks = 1000
    let type = 144

    for(let i = 0; i < 100; i++){
      events.push(createMIDIEvent(ticks, type, 60, 100))
      if(i % 2 === 0){
        type = 128
        ticks += 10
      }else{
        type = 144
        ticks += 90
      }
    }
    addMIDIEvents(part1, ...events)
*/
    addParts(track, part1, part2)
    addTracks(songId, track)
    updateSong(songId)
    button.disabled = false
  }

/*
  //startSong(song)
  // let song2 = createSong()

  // setTimeout(function(){
  //   startSong(song2, 5000)
  // }, 1000)

//   setTimeout(function(){
//     stopSong(song)
// //    stopSong(song2)
//   }, 200)
*/

  if(test === 2){
    //fetch('mozk545a.mid')
    fetch('minute_waltz.mid')
    .then(
      (response) => {
        return response.arrayBuffer()
      },
      (error) => {
        console.error(error)
      }
    )
    .then((ab) => {
      songId = songFromMIDIFile(parseMIDIFile(ab))
      //let mf = parseMIDIFile(ab)
      //songId = songFromMIDIFile(mf)
      //console.log('header:', mf.header)
      //console.log('# tracks:', mf.tracks.size)
      button.disabled = false
    })
  }

  button.addEventListener('click', function(){
    startSong(songId, 0)
  })

})
