import qambi, {
  Instrument,
  MIDIEvent,
} from '../../src/qambi'

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {

    let piano = new Instrument()

    piano.parseSampleData({release: [5, 'equal_power'], 61: '../../instruments/rhodes/FreesoundRhodes-000-061-c#3.mp3'})
    // piano.parseSampleData({
    //   release: [0.5, 'equal_power'],
    //   61: {
    //     url: '../../instruments/rhodes/FreesoundRhodes-000-061-c#3.mp3',
    //     release: [20, 'equal_power']
    //   }
    // })
    //piano.parseSampleData({url: '../../instruments/electric-piano2.json'})
    .then(() => {
      piano.processMIDIEvent(new MIDIEvent(0, 144, 61, 100))
      piano.processMIDIEvent(new MIDIEvent(960, 128, 61, 0))
    })

  })

})
