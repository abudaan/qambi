import qambi, {
  getMIDIInputs,
  SimpleSynth,
  getNoteData,
  MIDIEvent,
  MIDIEventTypes,
} from '../../src/qambi' // use "from 'qambi'" in your own code! so without the extra "../../"

document.addEventListener('DOMContentLoaded', function(){

  qambi.init({
    song: {
      type: 'Song',
      url: '../data/mozk545a.mid'
    },
    piano: {
      type: 'Instrument',
      url: '../../instruments/heartbeat/city-piano-light.json'
    }
  })
  .then((data) => {

    let {song, piano} = data
    //let synth = new SimpleSynth('square')

    song.getTracks().forEach(track => {
      track.setInstrument(piano)
      //track.setInstrument(synth)
      track.connectMIDIInputs(...getMIDIInputs())
    })

    initUI(song)
  })


  function initUI(song){

    let btnPlay = document.getElementById('play')
    let btnPause = document.getElementById('pause')
    let btnStop = document.getElementById('stop')
    let divLoading = document.getElementById('loading')
    divLoading.innerHTML = ''

    btnPlay.disabled = false
    btnPause.disabled = false
    btnStop.disabled = false

    btnPlay.addEventListener('click', function(){
      song.play()
    })

    btnPause.addEventListener('click', function(){
      song.pause()
    })

    btnStop.addEventListener('click', function(){
      song.stop()
    })

    let track = song.getTracks()[0];
    ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'].forEach(key => {

      let btnKey = document.getElementById(key)

      btnKey.addEventListener('mousedown', startNote, false)
      btnKey.addEventListener('mouseup', stopNote, false)
      btnKey.addEventListener('mouseout', stopNote, false)
    })

    function startNote(){
      let noteNumber = getNoteData({fullName: this.id}).number
      track.processMIDIEvent(new MIDIEvent(0, MIDIEventTypes.NOTE_ON, noteNumber, 100))
    }

    function stopNote(){
      let noteNumber = getNoteData({fullName: this.id}).number
      track.processMIDIEvent(new MIDIEvent(0, MIDIEventTypes.NOTE_OFF, noteNumber))
    }
  }
})