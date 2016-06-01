import qambi, {
  Song,
  Track,
  Sampler,
  getMIDIInputs,
  getInstruments,
  getGMInstruments,
} from '../../src/qambi' // use "from 'qambi'" in your own code! so without the extra "../../"


document.addEventListener('DOMContentLoaded', function(){

  let song
  let track
  let sampler

  qambi.init()
  .then(() => {
    song = new Song()
    track = new Track()
    sampler = new Sampler()
    song.addTracks(track)
    track.setInstrument(sampler)
    track.monitor = true
    initUI()
  })


  function initUI(){

    // setup drowndown menu for MIDI inputs

    let selectMIDIIn = document.getElementById('midiin')
    let MIDIInputs = getMIDIInputs()
    let html = '<option id="-1">select MIDI in</option>'

    MIDIInputs.forEach(port => {
      html += `<option id="${port.id}">${port.name}</option>`
    })
    selectMIDIIn.innerHTML = html

    selectMIDIIn.addEventListener('change', () => {
      let portId = selectMIDIIn.options[selectMIDIIn.selectedIndex].id
      track.disconnectMIDIInputs() // no arguments means disconnect from all inputs
      track.connectMIDIInputs(portId)
    })


    // setup drowndown menu for banks and instruments

    let selectBank = document.getElementById('bank')
    let selectInstrument = document.getElementById('instrument')
    let path = '../../instruments/heartbeat'

    let optionsHeartbeat = '<option id="select">select instrument</option>'
    let heartbeatInstruments = getInstruments()
    heartbeatInstruments.forEach((instr, key) => {
      optionsHeartbeat += `<option id="${key}">${instr.name}</option>`
    })

    let gmInstruments = getGMInstruments()
    let optionsGM = '<option id="select">select instrument</option>'
    gmInstruments.forEach((instr, key) => {
      optionsGM += `<option id="${key}">${instr.name}</option>`
    })

    selectBank.addEventListener('change', () => {
      let key = selectBank.options[selectBank.selectedIndex].id
      console.log(key)
      if(key === 'heartbeat'){
        selectInstrument.innerHTML = optionsHeartbeat
        path = '../../instruments/heartbeat'
      }else if(key === 'fluidsynth'){
        selectInstrument.innerHTML = optionsGM
        path = '../../instruments/fluidsynth'
      }
    })

    selectInstrument.innerHTML = optionsHeartbeat
    selectInstrument.addEventListener('change', () => {
      let key = selectInstrument.options[selectInstrument.selectedIndex].id
      let url = `${path}/${key}.json`
      sampler.parseSampleData({url})
      .then(() => {
        console.log(`loaded: ${key}`)
      })
    })
  }
})
