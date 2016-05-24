require(['qambi-umd.min'], function(qambi){

  console.log(qambi)

  qambi.init()
  .then(function() {
    var synth = new qambi.Instrument()
    synth.processMIDIEvent(new qambi.MIDIEvent(0, 144, 60, 100))
    synth.processMIDIEvent(new qambi.MIDIEvent(960, 128, 60, 0))
  })

})

