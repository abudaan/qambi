
//import fetch from 'isomorphic-fetch'
import {
  MIDIEvent,
  MIDINote,
  deleteMIDIEvent,
} from './midi_event'

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

  let on = new MIDIEvent(0, 144, 60, 100)
  let off = new MIDIEvent(128, 128, 60, 0)
  let note = new MIDINote(on, off)

  buttonStart.addEventListener('click', function(){
    //console.log(note)
  })

  buttonStop.addEventListener('click', function(){
    on.midiNote = null
  })
})
