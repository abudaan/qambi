requirejs.config({
  paths: {
    qambi: '//abumarkub.org/qambi/dist/qambi-umd.min'
  }
})

require(['qambi'], function(qambi){

  qambi.init()
  .then(function() {
    let song = new qambi.Song()
    let track = new qambi.Track()
    let part = new qambi.Part()
    let synth = new qambi.SimpleSynth()

    part.addEvents(new qambi.MIDIEvent(0, 144, 60, 100), new qambi.MIDIEvent(960, 128, 60, 0))
    track.setInstrument(synth)
    track.addParts(part)
    song.addTracks(track)
    song.update()
    song.play()
  })
})

