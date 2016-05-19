import qambi, {
  Instrument,
  MIDIEvent,
} from 'qambi'

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {
    let synth = new Instrument()
    synth.processMIDIEvent(new MIDIEvent(0, 144, 60, 100))
    synth.processMIDIEvent(new MIDIEvent(960, 128, 60, 0))
  })

})
