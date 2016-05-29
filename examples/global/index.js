document.addEventListener('DOMContentLoaded', function(){

  // qambi is a global variable
  qambi.init()
  .then(function(){

    let song = new Song()
    let track = new Track()
    let part = new Part()
    var synth = new SimpleSynth()

    part.addEvents(new MIDIEvent(0, 144, 60, 100), new MIDIEvent(960, 128, 60, 0))
    track.setInstrument(synth)
    track.addParts(part)
    song.addTracks(track)
    song.update()
    song.play()

  })

})
