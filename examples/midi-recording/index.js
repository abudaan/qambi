import qambi, {
  Song,
  Track,
  Instrument,
  getMIDIInputs,
  getMIDIOutputs,
} from '../../src/qambi'


import fetch from 'isomorphic-fetch'

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {
    initUI()
  })

  function initUI(){
    let song = new Song()
    let track = new Track()
    track.setRecordEnabled('midi')
    song.addTracks(track)
    song.update()

    let btnPlay = document.getElementById('play')
    let btnPause = document.getElementById('pause')
    let btnStop = document.getElementById('stop')
    let btnStartRecord = document.getElementById('record-start')
    let btnStopRecord = document.getElementById('record-stop')
    let btnUndoRecord = document.getElementById('record-undo')
    let btnInstrument = document.getElementById('instrument')
    let btnMetronome = document.getElementById('metronome')
    let divTempo = document.getElementById('tempo')
    let divPosition = document.getElementById('position')
    let divPositionTime = document.getElementById('position_time')
    let rangePosition = document.getElementById('playhead')
    let selectMIDIIn = document.getElementById('midiin')
    let selectMIDIOut = document.getElementById('midiout')
    let userInteraction = false

    btnPlay.disabled = false
    btnPause.disabled = false
    btnStop.disabled = false
    btnStartRecord.disabled = false
    btnStopRecord.disabled = false
    btnInstrument.disabled = false
    btnMetronome.disabled = false



    let MIDIInputs = getMIDIInputs()
    let html = '<option id="-1">select MIDI in</option>'
    MIDIInputs.forEach(port => {
      html += `<option id="${port.id}">${port.name}</option>`
    })
    selectMIDIIn.innerHTML = html

    selectMIDIIn.addEventListener('change', e => {
      let portId = selectMIDIIn.options[selectMIDIIn.selectedIndex].id
      track.disconnectMIDIInputs() // no arguments means disconnect from all inputs
      track.connectMIDIInputs(portId)
    })

    let MIDIOutputs = getMIDIOutputs()
    html = '<option id="-1">select MIDI out</option>'
    MIDIOutputs.forEach(port => {
      html += `<option id="${port.id}">${port.name}</option>`
    })
    selectMIDIOut.innerHTML = html

    selectMIDIOut.addEventListener('change', e => {
      let portId = selectMIDIOut.options[selectMIDIOut.selectedIndex].id
      track.disconnectMIDIOutputs() // no arguments means disconnect from all outputs
      track.connectMIDIOutputs(portId)
    })

    btnMetronome.addEventListener('click', function(){
      song.setMetronome() // if no arguments are provided it simply toggles
      btnMetronome.innerHTML = song.useMetronome ? 'metronome on' : 'metronome off'
    })

    btnPlay.addEventListener('click', function(){
      song.play()
    })

    btnPause.addEventListener('click', function(){
      song.pause()
    })

    btnStop.addEventListener('click', function(){
      song.stop()
    })

    btnStartRecord.addEventListener('click', function(){
      song.startRecording()
    })

    btnStopRecord.addEventListener('click', function(){
      song.stopRecording()
    })

    btnUndoRecord.addEventListener('click', function(){
      if(btnUndoRecord.innerHTML === 'undo record'){
        song.undoRecording()
        btnUndoRecord.innerHTML = 'redo record'
      }else{
        song.redoRecording()
        btnUndoRecord.innerHTML = 'undo record'
      }
    })

    btnInstrument.addEventListener('click', function(){
      if(track.getInstrument() === null){
        btnInstrument.innerHTML = 'remove instrument'
        track.setInstrument(new Instrument()) // by passing a new Instrument, the simple sinewave synth is used for instrument
      }else{
        btnInstrument.innerHTML = 'set instrument'
        track.setInstrument() // by not providing an instrument you remove the instrument from this track
      }
    })

    let position = song.getPosition()
    divPosition.innerHTML = position.barsAsString
    divPositionTime.innerHTML = position.timeAsString
    divTempo.innerHTML = `tempo: ${position.bpm} bpm`

    song.addEventListener('position', event => {
      divPosition.innerHTML = event.data.barsAsString
      divPositionTime.innerHTML = event.data.timeAsString
      divTempo.innerHTML = `tempo: ${event.data.bpm} bpm`
      if(!userInteraction){
        rangePosition.value = event.data.percentage
      }
    })

    song.addEventListener('stop_recording', e => {
      btnUndoRecord.disabled = false
    })

    song.addEventListener('start_recording', e => {
      btnUndoRecord.disabled = true
    })

    rangePosition.addEventListener('mouseup', e => {
      rangePosition.removeEventListener('mousemove', rangeListener)
      userInteraction = false
    })

    rangePosition.addEventListener('mousedown', e => {
      setTimeout(function(){
        song.setPosition('percentage', e.target.valueAsNumber)
      }, 0)
      rangePosition.addEventListener('mousemove', rangeListener)
      userInteraction = true
    })

    const rangeListener = function(e){
      song.setPosition('percentage', e.target.valueAsNumber)
    }
  }

})
