import qambi, {
  Song,
  Track,
  Instrument,
  getMIDIInputs,
  getInstruments,
  getGMInstruments,
} from '../../src/qambi' // use "from 'qambi'" in your own code! so without the extra "../../"


document.addEventListener('DOMContentLoaded', function(){

  let song
  let track
  let instrument

  qambi.init()
  .then(() => {
    song = new Song()
    track = new Track()
    instrument = new Instrument()
    song.addTracks(track)
    track.setInstrument(instrument)
    initUI()
  })


  function initUI(){

    let btnPlay = document.getElementById('play')
    let btnPause = document.getElementById('pause')
    let btnStop = document.getElementById('stop')
    let btnMetronome = document.getElementById('metronome')
    let divTempo = document.getElementById('tempo')
    let divPosition = document.getElementById('position')
    let divPositionTime = document.getElementById('position_time')
    let rangePosition = document.getElementById('playhead')
    let selectMIDIIn = document.getElementById('midiin')
    let selectInstrument = document.getElementById('instrument')
    let userInteraction = false

    btnPlay.disabled = false
    btnPause.disabled = false
    btnStop.disabled = false
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

    html = '<option id="select">select instrument</option>'

    let heartbeatInstruments = getInstruments()
    heartbeatInstruments.forEach((instr, key) => {
      html += `<option id="${key}">${instr.name}</option>`
    })

    //html += '<option id="separator">---</option>'

    let gmInstruments = getGMInstruments()
    gmInstruments.forEach((instr, key) => {
      html += `<option id="${key}">${instr.name}</option>`
    })
    selectInstrument.innerHTML = html

    selectInstrument.addEventListener('change', () => {
      let instrumentFileName = selectInstrument.options[selectInstrument.selectedIndex].id
      let url = ''
      if(heartbeatInstruments.has(instrumentFileName)){
        url = `../../instruments/heartbeat/${instrumentFileName}.json`
      }else if(gmInstruments.has(instrumentFileName)){
        url = `../../instruments/fluidsynth/${instrumentFileName}.json`
      }else{
        return
      }
      instrument.parseSampleData({url})
      .then(() => {
        console.log(`loaded: ${instrumentFileName}`)
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
  }

})
