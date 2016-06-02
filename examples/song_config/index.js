import qambi, {
  SimpleSynth,
  MIDIEvent,
  Song,
  Track,
  Part,
} from '../../src/qambi' // use "from 'qambi'" in your own code! so without the extra "../../"


document.addEventListener('DOMContentLoaded', function(){

  qambi.init()
  .then(() => {

    let song = new Song({
      bars: 1,
      tracks: [
        new Track({
          parts: [
            new Part({
              events: [
                new MIDIEvent(960 * 0, 144, 60, 100),
                new MIDIEvent(960 * 1, 128, 60, 0),
                new MIDIEvent(960 * 1, 144, 62, 100),
                new MIDIEvent(960 * 2, 128, 62, 0),
                new MIDIEvent(960 * 2, 144, 64, 100),
                new MIDIEvent(960 * 3, 128, 64, 0),
                new MIDIEvent(960 * 3, 144, 65, 100),
                new MIDIEvent(960 * 4, 128, 65, 0),
                new MIDIEvent(960 * 4, 144, 67, 100),
                new MIDIEvent(960 * 6, 128, 67, 0),
              ]
            })
          ],
          instrument: new SimpleSynth('sine')
        })
      ],
      useMetronome: true
    })

    song.play()
  })
})
