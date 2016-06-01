import qambi, {
  Song,
  Sampler,
  getMIDIInputs,
  getMIDIOutputs,
} from '../../src/qambi'


import fetch from 'isomorphic-fetch'

document.addEventListener('DOMContentLoaded', function(){

  let song
  let instrument = new Sampler()

  qambi.init({
    instrument: {
      type: 'Instrument',
      url: '../../instruments/heartbeat/city-piano-light.json'
    }
  })
  .then((loaded) => {

    ({instrument} = loaded)

    let test = 1

    if(test === 1){

      fetch('../data/mozk545a.mid')
      fetch('../data/minute_waltz.mid')
      .then(response => {
        return response.arrayBuffer()
      })
      .then(data => {
        song = Song.fromMIDIFileSync(data)
        initUI()
      })

    }else if(test === 2){

      Song.fromMIDIFile('../../data/minute_waltz.mid')
      .then(s => {
        song = s
        initUI()
      }, e => console.log(e))
    }
  })


  function initUI(){

    let btnPlay = document.getElementById('play')
    let btnPause = document.getElementById('pause')
    let btnStop = document.getElementById('stop')
    let btnInstrument = document.getElementById('instrument')
    let btnMetronome = document.getElementById('metronome')
    let divTempo = document.getElementById('tempo')
    let divPosition = document.getElementById('position')
    let divPositionTime = document.getElementById('position_time')
    let rangePosition = document.getElementById('playhead')
    let rangeLatency = document.getElementById('latency')
    let selectMIDIIn = document.getElementById('midiin')
    let selectMIDIOut = document.getElementById('midiout')
    let userInteraction = false

    btnPlay.disabled = false
    btnPause.disabled = false
    btnStop.disabled = false
    btnInstrument.disabled = false
    btnMetronome.disabled = false

    song.getTracks().forEach(track => {
      track.setInstrument(instrument)
      track.monitor = true // enable track for playing back MIDI events coming from external devices
    })


    let MIDIInputs = getMIDIInputs()
    let html = '<option id="-1">select MIDI in</option>'
    MIDIInputs.forEach(port => {
      html += `<option id="${port.id}">${port.name}</option>`
    })
    selectMIDIIn.innerHTML = html

    selectMIDIIn.addEventListener('change', e => {
      let portId = selectMIDIIn.options[selectMIDIIn.selectedIndex].id
      // song.getTracks().forEach(track => {
      //   track.disconnectMIDIInputs() // no arguments means disconnect from all inputs
      //   track.connectMIDIInputs(portId)
      // })
      let track = song.getTracks()[0]
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
      song.getTracks().forEach(track => {
        track.disconnectMIDIOutputs() // no arguments means disconnect from all outputs
        track.connectMIDIOutputs(portId)
      })
/*
      let track = song.getTracks()[0]
      track.disconnectMIDIOutputs(track.getMIDIOutputs()[0])
      //track.disconnectMIDIOutputs() // no arguments means disconnect from all inputs
      track.connectMIDIOutputs(portId)
*/
    })

    rangeLatency.addEventListener('change', e => {
      song.getTracks().forEach(track => {
        track.latency = e.target.valueAsNumber
      })
    })

    btnMetronome.addEventListener('click', function(){
      song.setMetronome() // if no arguments are provided it simply toggles
      btnMetronome.innerHTML = song.useMetronome ? 'metronome off' : 'metronome on'
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

    btnInstrument.addEventListener('click', function(){
      song.getTracks().forEach(track => {
        if(track.getInstrument() === null){
          btnInstrument.innerHTML = 'remove instrument'
          //track.setInstrument(new Instrument()) // by passing a new Instrument, the simple sinewave synth is used for instrument
          track.setInstrument(instrument) // by passing a new Instrument, the simple sinewave synth is used for instrument
        }else{
          btnInstrument.innerHTML = 'set instrument'
          track.setInstrument() // by not providing an instrument you remove the instrument from this track
        }
      })
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
