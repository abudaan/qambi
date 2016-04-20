
//import fetch from 'isomorphic-fetch'
import qambi, {
  MIDIEvent,
  MIDINote,
  Instrument,
  deleteMIDIEvent,
  getMIDIOutputIds,
  Part,
  Song,
} from './qambi'

/*
qambi.getMasterVolume()
//qambi.log('functions')
qambi.init().then(function(data){
  console.log(data, qambi.getMasterVolume())
  setMasterVolume(0.5)
})
*/


document.addEventListener('DOMContentLoaded', function(){

  let buttonStart = document.getElementById('start')
  let buttonStop = document.getElementById('stop')
  let buttonMove = document.getElementById('move')


  qambi.init()
  .then(function(){
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
      console.time('SONG')
      let song = Song.fromMIDIFile(ab)
      console.timeEnd('SONG')
      let instrument = new Instrument()
      song.getTracks().forEach(function(track){
        track.setInstrument(instrument)
        track.setMIDIOutputs(...getMIDIOutputIds())
      })
      buttonStart.addEventListener('click', function(){
        song.start()
      })

      buttonStop.addEventListener('click', function(){
        song.stop()
      })
    })
  })

/*
  let on = new MIDIEvent(0, 144, 60, 100)
  let off = new MIDIEvent(128, 128, 60, 0)
  let note = new MIDINote(on, off)


  let p = new Part('solo')
  p.addEvents(on, off)

  let p1 = p.copy()

  debugger
  buttonStart.addEventListener('click', function(){
    //console.log(note)
  })

  buttonStop.addEventListener('click', function(){
    on.midiNote = null
  })
*/
})
