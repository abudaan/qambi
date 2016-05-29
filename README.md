###qambi

Qambi is a rebuild of [heartbeat](https://abudaan.github.io/heartbeat) in es6. It is still work in progress and not all functionality has been ported yet. If you need a well-tested sequencer for your project you'd better use heartbeat.

You can install it via npm

```
$ npm install qambi
```

You can also add qambi as an UMD module to your project:

```

```

Here is a simple example that plays back an existing MIDI file:


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

You can find more examples in the `examples` folder and you can test some live examples [here](http://qambi.org). Documentation is work in progress, you can find it [here](https://github.com/abudaan/qambi/wiki).

