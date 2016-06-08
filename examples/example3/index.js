import qambi, {
  Song,
  Track,
  Sampler,
  getMIDIInputs,
  getInstruments,
  getGMInstruments,
} from 'qambi'

document.addEventListener('DOMContentLoaded', function(){

  let song
  let track
  let sampler
  const basePath = '../../' // you may have to adjust this path according to your folder layout

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
    let path = `${basePath}/instruments/heartbeat`

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
        path = `${basePath}/instruments/heartbeat`
      }else if(key === 'fluidsynth'){
        selectInstrument.innerHTML = optionsGM
        path = `${basePath}/instruments/fluidsynth`
      }
    })

    selectInstrument.innerHTML = optionsHeartbeat
    selectInstrument.addEventListener('change', () => {
      let key = selectInstrument.options[selectInstrument.selectedIndex].id
      let url = `${path}/${key}.json`


      // option 1: clear the samples of the currently loaded instrument after the new samples have been loaded
      sampler.parseSampleData({url, clearAll: true})
      .then(() => {
        console.log(`loaded: ${key}`)
      })
/*
      // option 2: clear the samples of the currently loaded instrument before loading the new samples
      sampler.clearAllSampleData()
      sampler.parseSampleData({url})
      .then(() => {
        console.log(`loaded: ${key}`)
      })
*/
    })
  }
})
