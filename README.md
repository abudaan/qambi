###qambi

Qambi is a rebuild of [heartbeat](https://abudaan.github.io/heartbeat) in es6. It is still work in progress so not all functionality has been ported yet. If you need a well-tested sequencer for your project you'd better use heartbeat.


##### Example 1: load MIDI file

``` javascript
import qambi from 'qambi'

qambi.init({
    song: {
      type: 'Song',
      url: 'http://qambi.org/midi/minute_waltz.mid'
    },
    piano: {
      type: 'Instrument',
      url: 'http://qambi.org/instruments/heartbeat/city-piano.json'
    }
  })
  .then((data) => {

    let {song, piano} = data

    song.getTracks().forEach(track => {
      track.setInstrument(piano)
    })
  })

```
[``[check live version]``](http://abudaan.github.io/qambi/examples/example1) &nbsp;-&nbsp; [``[more examples]``](http://abudaan.github.io/qambi/)

The `qambi.init()` initializes WebMIDI and WebAudio and prepares the sequencer. By passing an optional object you can preload MIDI files and audio samples.

If you set the type to `Song` a qambi song will be created from the loaded MIDI file. If you set the type to `Instrument` the audio samples will be loaded into a new `Instrument` instance.

The created `Song` and `Instrument` instances are returned as argument of the `then()` function.



##### Example 2: create new Song and save it as MIDI file

```javascript
import qambi, {
  Instrument,
  MIDIEvent,
  Song,
  Track,
  Part,
} from 'qambi'

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {

    let song = new Song({bars: 1})
    let track = new Track()
    let part = new Part()

    part.addEvents(
      new MIDIEvent(960 * 0, 144, 60, 100),
      new MIDIEvent(960 * 1, 128, 60, 0),
      new MIDIEvent(960 * 1, 144, 62, 100),
      new MIDIEvent(960 * 2, 128, 62, 0),
      new MIDIEvent(960 * 2, 144, 64, 100),
      new MIDIEvent(960 * 3, 128, 64, 0),
      new MIDIEvent(960 * 3, 144, 65, 100),
      new MIDIEvent(960 * 4, 128, 65, 0),
      new MIDIEvent(960 * 4, 144, 67, 100),
      new MIDIEvent(960 * 6, 128, 67, 0),
    )

    track.addParts(part)
    track.setInstrument(new Instrument())

    song.addTracks(track)
    song.update()

    song.play()
    song.saveAsMIDIFile('test.mid')
  })

})
```
[``[check live version]``](http://abudaan.github.io/qambi/examples/example2) &nbsp;-&nbsp; [``[more examples]``](http://abudaan.github.io/qambi/)



##### Example 3: play instruments using your MIDI keyboard

```
import qambi, {
  Song,
  Track,
  Instrument,
  getMIDIInputs,
  getInstruments,
  getGMInstruments,
} from 'qambi'


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
      instrument.parseSampleData({url})
      .then(() => {
        console.log(`loaded: ${key}`)
      })
    })
  }
})

```
[``[check live version]``](http://abudaan.github.io/qambi/examples/example3) &nbsp;-&nbsp; [``[more examples]``](http://abudaan.github.io/qambi/)
