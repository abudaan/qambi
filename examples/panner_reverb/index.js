import qambi, {
  getMIDIInputs,
  SimpleSynth,
  getNoteData,
  MIDIEvent,
  MIDIEventTypes,
  ConvolutionReverb,
} from 'qambi'


document.addEventListener('DOMContentLoaded', function(){

  qambi.init({
    song: {
      type: 'Song',
      url: '../data/minute_waltz.mid'
    },
    piano: {
      type: 'Instrument',
      url: '../../instruments/heartbeat/city-piano-light.json'
    }
  })
  .then(main)
})


function main(data){

  let {song, piano} = data
  let synth = new SimpleSynth('sine')

  song.getTracks().forEach(track => {
    track.setInstrument(piano)
    //track.setInstrument(synth)
    // listen to all connected MIDI input devices
    track.connectMIDIInputs(...getMIDIInputs())
    // enable monitor (like in Logic and Cubase)
    track.monitor = true
  })

  let btnPlay = document.getElementById('play')
  let btnPause = document.getElementById('pause')
  let btnStop = document.getElementById('stop')
  let btnFX = document.getElementById('fx')
  let divLoading = document.getElementById('loading')
  let rangePanner = document.getElementById('panning')
  let rangeReverb = document.getElementById('reverb')
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


  // create convolution reverb
  let hasReverb = false
  let reverb = new ConvolutionReverb()
  reverb.loadBuffer('../data/100-Reverb.mp3')
  .then(
    () => {
      btnFX.disabled = false
    },
    e => console.log(e)
  )

  btnFX.addEventListener('click', function(){
    hasReverb = !hasReverb
    if(hasReverb){
      song.getTracks().forEach(t => {
        t.insertEffect(reverb)
      })
      btnFX.innerHTML = 'remove reverb'
      rangeReverb.disabled = false
    }else{
      song.getTracks().forEach(t => {
        //t.removeEffect(0)
        //t.removeEffect(reverb)
        t.removeEffectAt(0)
      })
      btnFX.innerHTML = 'add reverb'
      rangeReverb.disabled = true
      //rangeReverb.value = 0
      //reverb.setAmount(0)
    }
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

  function setPanning(e){
    song.getTracks().forEach(t => {
      t.setPanning(e.target.valueAsNumber)
    })
    //song.setPanning(e.target.valueAsNumber)
    //console.log(e.target.valueAsNumber)
  }

  rangePanner.addEventListener('mousedown', e => {
    rangePanner.addEventListener('mousemove', setPanning, false)
  })

  rangePanner.addEventListener('mouseup', e => {
    rangePanner.removeEventListener('mousemove', setPanning, false)
  })


  function setReverb(e){
    if(hasReverb === false){
      return
    }
    reverb.setAmount(e.target.valueAsNumber)
    //console.log(e.target.valueAsNumber)
  }

  rangeReverb.addEventListener('mousedown', e => {
    rangeReverb.addEventListener('mousemove', setReverb, false)
  })

  rangeReverb.addEventListener('mouseup', e => {
    rangeReverb.removeEventListener('mousemove', setReverb, false)
  })
}
