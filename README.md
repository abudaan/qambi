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

Some live examples can be found [here](http://abudaan.github.io/qambi/examples/index.html), more examples in the [examples](https://github.com/abudaan/qambi/tree/gh-pages/examples) folder of the repository. Like qambi itself, all examples are written in es2016 so they need to be compiled to es5 before you can run them in a browser. In the repository I have included the compiled build.js files for all examples so you can run them right away. However, if you want to experiment with the examples you need to compile them before you see your changes. The simplest way to do this is:

 - cd into the examples folder and run `npm install` (only needed the first time)
 - cd into the folder of the example that you want to experiment with and run `npm run watch`

Now the main.js file will be compiled immediately after every edit of the file.


#####Playgrounds

You can try qambi without installation by using the qambi templates on [jsbin](http://jsbin.com/kosuva/edit?js,output) or [codepen](http://codepen.io/abudaan/pen/YqmMbK?editors=0010)


#####Documentation

Documentation is work in progress, see the [wiki](https://github.com/abudaan/qambi/wiki).



