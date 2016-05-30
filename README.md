###qambi

Qambi is a rebuild of [heartbeat](https://abudaan.github.io/heartbeat) in es2016. It is still work in progress and not all functionality has been ported yet. If you need a well-tested sequencer for your project you'd better use heartbeat.


#####Installation

Recommended is to install qambi via npm:

```
$ npm install qambi
```

But you can also add qambi as an AMD module:
```javascript
requirejs.config({
  paths: {
    qambi: '//qambi.org/dist/qambi-umd.min'
  }
})

```


Or as a global variable:
```html
  <script src="//qambi.org/dist/qambi-umd.min.js"></script>
  <script src="//qambi.org/dist/globals.js"></script>
```
The last script file creates global variables for all qambi modules. This is not mandatory: if you add it you can for instance create a new song with `new Song()`, if you omit it you have to type `new qambi.Song()`.


#####Examples

A simple example that plays back an existing MIDI file:


``` javascript
import qambi from 'qambi'

qambi.init({
    song: {
      type: 'Song',
      url: '//qambi.org/midi/minute_waltz.mid'
    },
    piano: {
      type: 'Instrument',
      url: '//qambi.org/instruments/heartbeat/city-piano-light.json'
    }
  })
  .then(data => {

    let {song, piano} = data

    song.getTracks().forEach(track => {
      track.setInstrument(piano)
    })

    song.play()
  })

```

Some live examples:

  1. Creates a song from a MIDI file and plays it back using City Piano, a qambi sample instrument with 4 velocity layer: [link](http://qambi.org/examples/example1/)
  2. Create song from scratch and save it as MIDI file: [link](http://qambi.org/examples/example2/)
  3. Play instruments using your MIDI keyboard: [link](http://qambi.org/examples/example3/)
  4. Record MIDI: [link](http://qambi.org/examples/midi-recording/)
  5. Playback a MIDI file via an external softsynth: [link](http://qambi.org/examples/midi-sync/) and a screencast explaining how to use it on [youtube](https://www.youtube.com/embed/zj1Sof90N7k)

More examples in the [examples](https://github.com/abudaan/qambi/tree/gh-pages/examples) folder of the repository.


######Documentation

Documentation is work in progress, see the [wiki](https://github.com/abudaan/qambi/wiki).

#####Playgrounds

You can try qambi without installation by using the qambi templates on [jsbin](http://jsbin.com/kosuva/edit?js,output) or [codepen](http://codepen.io/abudaan/pen/YqmMbK?editors=0010)


