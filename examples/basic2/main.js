import qambi, {
  Sampler,
  MIDIEvent,
  Track,
  getAudioContext,
} from 'qambi'

document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {

    let piano = new Sampler()
    let track = new Track({instrument: piano})
    track.setInstrument(piano)
    track.connect(getAudioContext().destination)

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
      console.log('play')
      track.processMIDIEvent(new MIDIEvent(0, 145, 61, 100, 10))
      track.processMIDIEvent(new MIDIEvent(960, 129, 61, 0, 10))
    })

  })

})
