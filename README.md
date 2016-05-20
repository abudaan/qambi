###qambi

Qambi is a rebuild of [heartbeat](https://abudaan.github.io/heartbeat) in es6. It is still work in progress so not all functionality has been ported yet. If you need a well-tested sequencer for your project you'd better use heartbeat.


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

The `qambi.init()` initializes WebMIDI and WebAudio and prepares the sequencer. By passing an optional object you can preload MIDI files and audio samples.

If you set the type to `Song` a qambi song will be created from the loaded MIDI file. If you set the type to `Instrument` the audio samples will be loaded into a new `Instrument` instance.

The created `Song` and `Instrument` instances are returned as argument of the `then()` function.

Check the [live version](http://abudaan.github.io/qambi/examples/basic4) of this example. More examples [here](http://abudaan.github.io/qambi/).

