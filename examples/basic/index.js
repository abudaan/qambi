import qambi, {
  Instrument,
  MIDIEvent,
} from '../../src/qambi' // remove ../../src/

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {
    let synth = new Instrument()
    synth.processMIDIEvent(new MIDIEvent(0, 144, 60, 100))
    synth.processMIDIEvent(new MIDIEvent(960, 128, 60, 0))
  })

})
