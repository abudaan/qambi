import qambi, {
  MIDIEvent,
  Instrument,
} from '../../src/qambi'


import {
  parseSamples,
} from '../../src/parse_audio'

import {
  base64
} from './sample' // import a base64 encoded audio file


document.addEventListener('DOMContentLoaded', function(){

  let test = 5
  let instrument = new Instrument()


  if(test === 1){

    parseSamples({50: base64})
    //parseSamples(base64)
    .then(data => {
      let buffer = data['50'] // sample is stored in the result object with the same key, so '50' in this case
      //let buffer = data[0]
      if(typeof buffer === 'undefined'){
        console.log('error loading sample')
      }

      instrument.updateSampleData({
        note: 50,
        buffer,
        release: [0, 'linear'],
      }, {
        note: 52,
        buffer,
        release: [5, 'linear'],
      })
      instrument.processMIDIEvent(new MIDIEvent(960 * 0, 144, 50, 100))
      instrument.processMIDIEvent(new MIDIEvent(960 * 1, 128, 50, 0))
      instrument.processMIDIEvent(new MIDIEvent(960 * 2, 144, 52, 100))
      instrument.processMIDIEvent(new MIDIEvent(960 * 3, 128, 52, 0))
    })


  }else if(test === 2){

    parseSamples({50: '../data/B0-49-96.wav'})
    .then(data => {

      let buffer = data['50'] // sample is stored in the result object with the same key, so '50' in this case
      if(typeof buffer === 'undefined'){
        console.log('error loading sample 50')
      }

      instrument.updateSampleData({
        note: 50,
        buffer,
        release: [4, 'linear'],
      })
      instrument.processMIDIEvent(new MIDIEvent(960 * 0, 144, 50, 100))
      instrument.processMIDIEvent(new MIDIEvent(960 * 1, 128, 50, 0))

      setTimeout(() => {
        let envelope = new Array(100).fill(1)
        envelope = envelope.map(function(value, index){
          if(index % 2 === 0){
            return 0.3
          }
          return value
        })

        // update envelope of note 50
        instrument.updateSampleData({
          note: 50,
          release: [4, envelope],
        })
        instrument.processMIDIEvent(new MIDIEvent(0, 144, 50, 100))
        instrument.processMIDIEvent(new MIDIEvent(200, 128, 50, 0))

      }, 2000)
    })

  }else if(test === 3){

    parseSamples('../data/B0-49-96.wav', '../data/TP01d-ElectricPiano-000-060-c3.wav')
    //parseSamples(['../../data/B0-49-96.wav', '../../data/TP01d-ElectricPiano-000-060-c3.wav']) -> not recommended
    //parseSamples({40: '../../data/B0-49-96.wav'})
    //parseSamples('../../data/B0-49-96.wav')
    .then(data => {
      //console.log(data)
      data.forEach(d => {
        if(typeof d === 'undefined'){
          console.log('error loading sample')
        }
      })

      let buffer1 = data[0]
      let buffer2 = data[1]

      instrument.updateSampleData({
        note: 60,
        buffer: buffer1,
        sustain: [0],
        release: [4, 'equal_power'],
        velocity: [0, 101],
        pan: -1
      })

      instrument.updateSampleData({
        note: 60,
        sustain: [25, 2500],
        velocity: [0, 1],
      })

      instrument.updateSampleData({
        note: 60,
        buffer: buffer2,
        velocity: [101, 127],
      })

      instrument.processMIDIEvent(new MIDIEvent(960 * 0, 144, 60, 100))
      instrument.processMIDIEvent(new MIDIEvent(960 * 1, 128, 60, 0))

      instrument.processMIDIEvent(new MIDIEvent(960 * 2, 144, 60, 101))
      instrument.processMIDIEvent(new MIDIEvent(960 * 3, 128, 60, 0))
    })

  }else if(test === 4){

    let json = {
      60: {
        url: '../data/TP01d-ElectricPiano-000-060-c3.wav',
        sustain: [0],
        release: [20, 'equal_power'],
      },
      62: '../data/TP01d-ElectricPiano-000-060-c3.wav',
      64: base64,
      release: [2, 'equal_power']
    }

    instrument.parseSampleData(json).then(
      function(){
        instrument.processMIDIEvent(new MIDIEvent(960 * 0, 144, 60, 100))
        instrument.processMIDIEvent(new MIDIEvent(960 * 1, 128, 60, 0))

        instrument.processMIDIEvent(new MIDIEvent(960 * 2, 144, 62, 100))
        instrument.processMIDIEvent(new MIDIEvent(960 * 3, 128, 62, 0))

        instrument.processMIDIEvent(new MIDIEvent(960 * 4, 144, 64, 100))
        instrument.processMIDIEvent(new MIDIEvent(960 * 5, 128, 64, 0))
      }
    )

  }else if(test === 5){

    let rhodes = {"release": [4, "equal_power"], "28": "../../instruments/rhodes/FreesoundRhodes-000-028-e0.mp3", "29": "../../instruments/rhodes/FreesoundRhodes-000-029-f0.mp3", "30": "../../instruments/rhodes/FreesoundRhodes-000-030-f#0.mp3", "31": "../../instruments/rhodes/FreesoundRhodes-000-031-g0.mp3", "32": "../../instruments/rhodes/FreesoundRhodes-000-032-g#0.mp3", "33": "../../instruments/rhodes/FreesoundRhodes-000-033-a0.mp3", "34": "../../instruments/rhodes/FreesoundRhodes-000-034-a#0.mp3", "35": "../../instruments/rhodes/FreesoundRhodes-000-035-h0.mp3", "36": "../../instruments/rhodes/FreesoundRhodes-000-036-c1.mp3", "37": "../../instruments/rhodes/FreesoundRhodes-000-037-c#1.mp3", "38": "../../instruments/rhodes/FreesoundRhodes-000-038-d1.mp3", "39": "../../instruments/rhodes/FreesoundRhodes-000-039-d#1.mp3", "40": "../../instruments/rhodes/FreesoundRhodes-000-040-e1.mp3", "41": "../../instruments/rhodes/FreesoundRhodes-000-041-f1.mp3", "42": "../../instruments/rhodes/FreesoundRhodes-000-042-f#1.mp3", "43": "../../instruments/rhodes/FreesoundRhodes-000-043-g1.mp3", "44": "../../instruments/rhodes/FreesoundRhodes-000-044-g#1.mp3", "45": "../../instruments/rhodes/FreesoundRhodes-000-045-a1.mp3", "46": "../../instruments/rhodes/FreesoundRhodes-000-046-a#1.mp3", "47": "../../instruments/rhodes/FreesoundRhodes-000-047-h1.mp3", "48": "../../instruments/rhodes/FreesoundRhodes-000-048-c2.mp3", "49": "../../instruments/rhodes/FreesoundRhodes-000-049-c#2.mp3", "50": "../../instruments/rhodes/FreesoundRhodes-000-050-d2.mp3", "51": "../../instruments/rhodes/FreesoundRhodes-000-051-d#2.mp3", "52": "../../instruments/rhodes/FreesoundRhodes-000-052-e2.mp3", "53": "../../instruments/rhodes/FreesoundRhodes-000-053-f2.mp3", "54": "../../instruments/rhodes/FreesoundRhodes-000-054-f#2.mp3", "55": "../../instruments/rhodes/FreesoundRhodes-000-055-g2.mp3", "56": "../../instruments/rhodes/FreesoundRhodes-000-056-g#2.mp3", "57": "../../instruments/rhodes/FreesoundRhodes-000-057-a2.mp3", "58": "../../instruments/rhodes/FreesoundRhodes-000-058-a#2.mp3", "59": "../../instruments/rhodes/FreesoundRhodes-000-059-h2.mp3", "60": "../../instruments/rhodes/FreesoundRhodes-000-060-c3.mp3", "61": "../../instruments/rhodes/FreesoundRhodes-000-061-c#3.mp3", "62": "../../instruments/rhodes/FreesoundRhodes-000-062-d3.mp3", "63": "../../instruments/rhodes/FreesoundRhodes-000-063-d#3.mp3", "64": "../../instruments/rhodes/FreesoundRhodes-000-064-e3.mp3", "65": "../../instruments/rhodes/FreesoundRhodes-000-065-f3.mp3", "66": "../../instruments/rhodes/FreesoundRhodes-000-066-f#3.mp3", "67": "../../instruments/rhodes/FreesoundRhodes-000-067-g3.mp3", "68": "../../instruments/rhodes/FreesoundRhodes-000-068-g#3.mp3", "69": "../../instruments/rhodes/FreesoundRhodes-000-069-a3.mp3", "70": "../../instruments/rhodes/FreesoundRhodes-000-070-a#3.mp3", "71": "../../instruments/rhodes/FreesoundRhodes-000-071-h3.mp3", "72": "../../instruments/rhodes/FreesoundRhodes-000-072-c4.mp3", "73": "../../instruments/rhodes/FreesoundRhodes-000-073-c#4.mp3", "74": "../../instruments/rhodes/FreesoundRhodes-000-074-d4.mp3", "75": "../../instruments/rhodes/FreesoundRhodes-000-075-d#4.mp3", "76": "../../instruments/rhodes/FreesoundRhodes-000-076-e4.mp3", "77": "../../instruments/rhodes/FreesoundRhodes-000-077-f4.mp3", "78": "../../instruments/rhodes/FreesoundRhodes-000-078-f#4.mp3", "79": "../../instruments/rhodes/FreesoundRhodes-000-079-g4.mp3", "80": "../../instruments/rhodes/FreesoundRhodes-000-080-g#4.mp3", "81": "../../instruments/rhodes/FreesoundRhodes-000-081-a4.mp3", "82": "../../instruments/rhodes/FreesoundRhodes-000-082-a#4.mp3", "83": "../../instruments/rhodes/FreesoundRhodes-000-083-h4.mp3", "84": "../../instruments/rhodes/FreesoundRhodes-000-084-c5.mp3", "85": "../../instruments/rhodes/FreesoundRhodes-000-085-c#5.mp3", "86": "../../instruments/rhodes/FreesoundRhodes-000-086-d5.mp3", "87": "../../instruments/rhodes/FreesoundRhodes-000-087-d#5.mp3", "88": "../../instruments/rhodes/FreesoundRhodes-000-088-e5.mp3", "89": "../../instruments/rhodes/FreesoundRhodes-000-089-f5.mp3", "90": "../../instruments/rhodes/FreesoundRhodes-000-090-f#5.mp3", "91": "../../instruments/rhodes/FreesoundRhodes-000-091-g5.mp3", "92": "../../instruments/rhodes/FreesoundRhodes-000-092-g#5.mp3", "93": "../../instruments/rhodes/FreesoundRhodes-000-093-a5.mp3", "94": "../../instruments/rhodes/FreesoundRhodes-000-094-a#5.mp3", "95": "../../instruments/rhodes/FreesoundRhodes-000-095-h5.mp3", "96": "../../instruments/rhodes/FreesoundRhodes-000-096-c6.mp3", "97": "../../instruments/rhodes/FreesoundRhodes-000-097-c#6.mp3", "98": "../../instruments/rhodes/FreesoundRhodes-000-098-d6.mp3", "99": "../../instruments/rhodes/FreesoundRhodes-000-099-d#6.mp3", "100": "../../instruments/rhodes/FreesoundRhodes-000-100-e6.mp3"}

    instrument.parseSampleData(rhodes).then(
      function(){
        instrument.processMIDIEvent(new MIDIEvent(960 * 0, 144, 60, 100))
        instrument.processMIDIEvent(new MIDIEvent(960 * 1, 128, 60, 0))

        instrument.processMIDIEvent(new MIDIEvent(960 * 2, 144, 62, 100))
        instrument.processMIDIEvent(new MIDIEvent(960 * 3, 128, 62, 0))

        instrument.processMIDIEvent(new MIDIEvent(960 * 4, 144, 64, 100))
        instrument.processMIDIEvent(new MIDIEvent(960 * 5, 128, 64, 0))
      }
    )
  }

})
