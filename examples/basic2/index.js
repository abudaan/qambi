import qambi, {
  Instrument,
  MIDIEvent,
} from '../../src/qambi'

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {

    let piano = new Instrument()

    //piano.parseSampleData({release: [5, 'equal_power'], 61: '../../instruments/rhodes/FreesoundRhodes-000-061-c#3.mp3'})
    // piano.parseSampleData({
    //   release: [0.5, 'equal_power'],
    //   61: {
    //     url: '../../instruments/rhodes/FreesoundRhodes-000-061-c#3.mp3',
    //     release: [20, 'equal_power']
    //   }
    // })
    piano.parseSampleData({
      url: '../data/electric-piano2.json' // can be an absolute url as well
      //baseUrl: '../../instruments/rhodes' // url of the folder where the mp3 files are stored, can be an absolute url as well
    })
    .then(() => {
      piano.processMIDIEvent(new MIDIEvent(0, 144, 61, 100))
      piano.processMIDIEvent(new MIDIEvent(960, 128, 61, 0))
    })

  })

})
