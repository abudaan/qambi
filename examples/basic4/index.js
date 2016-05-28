import qambi, {
  getMIDIInputs,
  SimpleSynth,
  getNoteData,
  MIDIEvent,
  MIDIEventTypes,
} from '../../src/qambi' // use "from 'qambi'" in your own code! so without the extra "../../"

document.addEventListener('DOMContentLoaded', function(){

  // during development is it recommended to set the instrument to 'synth' so you don't have to wait for all piano samples to be loaded and parsed
  qambi.init({
    song: {
      type: 'Song',
      url: '../data/minute_waltz.mid'
    },
    // piano: {
    //   type: 'Instrument',
    //   url: '../../instruments/heartbeat/city-piano-light.json'
    // }
  })
  .then((data) => {

    let {song, piano} = data
    let synth = new SimpleSynth('sine')

    song.getTracks().forEach(track => {
      //track.setInstrument(piano)
      track.setInstrument(synth)
      // listen to all connected MIDI input devices
      track.connectMIDIInputs(...getMIDIInputs())
      // enable monitor (like in Logic and Cubase)
      track.monitor = true
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

    // very rudimental on-screen keyboard
    let track = song.getTracks()[0]
    let keys = new Map();
    ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'].forEach(key => {

      let btnKey = document.getElementById(key)
      keys.set(key, btnKey)

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

    // add listeners for all noteon and noteoff events
    song.addEventListener('noteOn', e => {
      // console.log(e.data)
      let btn = keys.get(e.data.fullNoteName)
      // check if this key exists on the on-screen keyboard
      if(btn){
        btn.className = 'key-down'
      }
    })

    song.addEventListener('noteOff', e => {
      // console.log(e.data)
      let btn = keys.get(e.data.fullNoteName)
      if(btn){
        btn.className = 'key-up'
      }
    })

    // set all keys of the on-screen keyboard to the up state when the song stops or pauses
    song.addEventListener('stop', () => {
      keys.forEach(key => {
        key.className = 'key-up'
      })
    })

    song.addEventListener('pause', () => {
      keys.forEach(key => {
        key.className = 'key-up'
      })
    })
  }
})
