
//import fetch from 'isomorphic-fetch'
import qambi, {
  MIDIEvent,
  MIDINote,
  Instrument,
  deleteMIDIEvent,
  getMIDIOutputIds,
  Part,
  Song,
} from './qambi'

import {
  typeString
} from './util'

/*
qambi.getMasterVolume()
//qambi.log('functions')
qambi.init().then(function(data){
  console.log(data, qambi.getMasterVolume())
  setMasterVolume(0.5)
})
*/


document.addEventListener('DOMContentLoaded', function(){

  let buttonStart = document.getElementById('start')
  let buttonStop = document.getElementById('stop')
  let buttonMove = document.getElementById('move')

  let test = 3

  if(test === 1){
    qambi.init()
    .then(function(){
      fetch('minute_waltz.mid')
      .then(
        (response) => {
          return response.arrayBuffer()
        },
        (error) => {
          console.error(error)
        }
      )
      .then((ab) => {
        console.time('SONG')
        let song = Song.fromMIDIFile(ab)
        console.timeEnd('SONG')
        let instrument = new Instrument()
        song.getTracks().forEach(function(track){
          track.setInstrument(instrument)
          track.setMIDIOutputs(...getMIDIOutputIds())
        })
        buttonStart.addEventListener('click', function(){
          song.start()
        })

        buttonStop.addEventListener('click', function(){
          song.stop()
        })
      })
    })
  }


  if(test === 3){
    let base64 = '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Mw0KCQICYnM3X3B+ukyVjw3/+xBEmo/wjwlUgekoSg9BKjA9JwlCCBlWBjEiaDkEqUDEiFTxMSICQTIxNt7jProHwkEZbUKS5AgUalEwU1raJmchG0+Ki4IQYalBYUWofATbEIbLNkYTQkbrDQ1pR1BNWYi9CfTj/f/7EEScj/CHCVSBiRC6DkEqQDDFFwH0JVIHpGEgOQTpAPMIXEmp4VxWqooO5RjcdQqPQsI2zU3jeWmP2icKtpRp1PSYIty7mL549i8QS4Mlyu5JSrDhRYewoaK0hIESg8afYKAUIQx9//sQRKAP8JEJ1QHpMJoPYTpAMGVDAgglUgekQSA9BKjA9JQkQ1tFKkkzK/R7rSTVT8Ll4qCdVCSzOJk0DbOHRMu+3iqCtASEoMQ4HYtrTZYfNnkqQbtIAAsMQ4HY3WlowPkxnmOLUhD/+xBEoY/wjAbUgeZgmA7hGjA9IxdCBB9UB7Bg4D8EqMD0jFSF6xqQeQjInMhROrPcq9s2HRbWEMYiBg8kHbq4k42bDbTQ8MAWRyAUo5iHhXEGvuqO9NMy8J22BaKiPCuYjooQTMMgSP/7EESjD/CICVUBhhBAEAE6MDEnJQIcGVQHpSJoPoSpAPSMVHg0RD7J5deh4YQpywlMyiDZIKJBxqnvHwwyqygL4hJECF4XNWQNSC8GdxxQIh6pDCryMTRCNCHw900sYxTIDgRaXbDJ//sQRKQP8IAI1QGJEEoOwSowPSUJAfAjVAYkQShBBKiAxhhUaEswQdw43iThj91bZrklQgbi7aYCNcGlWQ/DjaiRwl9iQwKyRJJdIEmTiTngqILQfl9aeGn4aO4tAD0zqUaLgAmVKy3/+xBEpo/whwlVAewwGA8BOjA8wSkCKCVSBjBBIDoE6QCTFJRi/oDJJiHKOoIcVww15SmQoVLKbzIYapkCn18pGYaS02Lv88AAVCopJUOBQS78grIKttoAAFCgIL4VTEFNRTMuOTlVVf/7EESoj/CGCVUB5hIIDmEqQD0iCQIQI1QGMEEgQASowJYYHFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQRKqP8IcI1IGGSAgPIRpAMMYBAiQjUgekwKg5hKkA9JhEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVX/+xBErI/wiAlVAYkQuA8BKkAwwxUB/CNUB6RhIDsEqQD0jFRVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7EESvAACzCdQFPCAKFOE6IKeEAQSoM0gZhAAAeIZoAx5gAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//sQRJmP8IADTMckwAoI4Dp04YABwAABpAAAACAAADSAAAAEVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU='
    let bin = atob(base64)
    //console.log(bin instanceof Blob)
    // qambi.getAudioContext().decodeAudioData(bin,
    //   function(buffer)
    //   {
    //     console.log(buffer)
    //   },
    //   function(e){
    //     console.log(e)
    //   }
    // )
    let instrument = new Instrument()

    // let data = {
    //   60: new ArrayBuffer(),
    //   61: {
    //     url: 'url',
    //     sustain: []
    //   },
    // }
    // console.log(typeof data[60] === 'object')
    // console.log(data[60] instanceof Object)
    // console.log(typeof data[61] === 'object')

    // let a = []
    // let o = {}
    // console.log(a instanceof Object, o instanceof Object)

    // instrument.addSampleData(60, {
    //   url: '../data/TP01d-ElectricPiano-000-060-c3.wav',
    //   sustain: [0],
    //   release: [4, 'equal power'],
    // })

    //console.log(typeString(instrument))


    let json = {
      60: {
        url: '../data/TP01d-ElectricPiano-000-060-c3.wav',
        sustain: [0],
        release: [4, 'equal power'],
      },
      61: {
        url: '../data/TP01d-ElectricPiano-000-060-c3.wav',
        sustain: [0],
        release: [4, 'equal power'],
      },
      62: {
        url: '../data/TP01d-ElectricPiano-000-060-c3.wav',
        sustain: [0],
        release: [3, 'equal power'],
      },
      63: '../data/TP01d-ElectricPiano-000-060-c3.wav',
      64: base64,
    }


    let rhodes = {"release": [4, "equal power"], "28": "../instruments/rhodes/FreesoundRhodes-000-028-e0.mp3", "29": "../instruments/rhodes/FreesoundRhodes-000-029-f0.mp3", "30": "../instruments/rhodes/FreesoundRhodes-000-030-f#0.mp3", "31": "../instruments/rhodes/FreesoundRhodes-000-031-g0.mp3", "32": "../instruments/rhodes/FreesoundRhodes-000-032-g#0.mp3", "33": "../instruments/rhodes/FreesoundRhodes-000-033-a0.mp3", "34": "../instruments/rhodes/FreesoundRhodes-000-034-a#0.mp3", "35": "../instruments/rhodes/FreesoundRhodes-000-035-h0.mp3", "36": "../instruments/rhodes/FreesoundRhodes-000-036-c1.mp3", "37": "../instruments/rhodes/FreesoundRhodes-000-037-c#1.mp3", "38": "../instruments/rhodes/FreesoundRhodes-000-038-d1.mp3", "39": "../instruments/rhodes/FreesoundRhodes-000-039-d#1.mp3", "40": "../instruments/rhodes/FreesoundRhodes-000-040-e1.mp3", "41": "../instruments/rhodes/FreesoundRhodes-000-041-f1.mp3", "42": "../instruments/rhodes/FreesoundRhodes-000-042-f#1.mp3", "43": "../instruments/rhodes/FreesoundRhodes-000-043-g1.mp3", "44": "../instruments/rhodes/FreesoundRhodes-000-044-g#1.mp3", "45": "../instruments/rhodes/FreesoundRhodes-000-045-a1.mp3", "46": "../instruments/rhodes/FreesoundRhodes-000-046-a#1.mp3", "47": "../instruments/rhodes/FreesoundRhodes-000-047-h1.mp3", "48": "../instruments/rhodes/FreesoundRhodes-000-048-c2.mp3", "49": "../instruments/rhodes/FreesoundRhodes-000-049-c#2.mp3", "50": "../instruments/rhodes/FreesoundRhodes-000-050-d2.mp3", "51": "../instruments/rhodes/FreesoundRhodes-000-051-d#2.mp3", "52": "../instruments/rhodes/FreesoundRhodes-000-052-e2.mp3", "53": "../instruments/rhodes/FreesoundRhodes-000-053-f2.mp3", "54": "../instruments/rhodes/FreesoundRhodes-000-054-f#2.mp3", "55": "../instruments/rhodes/FreesoundRhodes-000-055-g2.mp3", "56": "../instruments/rhodes/FreesoundRhodes-000-056-g#2.mp3", "57": "../instruments/rhodes/FreesoundRhodes-000-057-a2.mp3", "58": "../instruments/rhodes/FreesoundRhodes-000-058-a#2.mp3", "59": "../instruments/rhodes/FreesoundRhodes-000-059-h2.mp3", "60": "../instruments/rhodes/FreesoundRhodes-000-060-c3.mp3", "61": "../instruments/rhodes/FreesoundRhodes-000-061-c#3.mp3", "62": "../instruments/rhodes/FreesoundRhodes-000-062-d3.mp3", "63": "../instruments/rhodes/FreesoundRhodes-000-063-d#3.mp3", "64": "../instruments/rhodes/FreesoundRhodes-000-064-e3.mp3", "65": "../instruments/rhodes/FreesoundRhodes-000-065-f3.mp3", "66": "../instruments/rhodes/FreesoundRhodes-000-066-f#3.mp3", "67": "../instruments/rhodes/FreesoundRhodes-000-067-g3.mp3", "68": "../instruments/rhodes/FreesoundRhodes-000-068-g#3.mp3", "69": "../instruments/rhodes/FreesoundRhodes-000-069-a3.mp3", "70": "../instruments/rhodes/FreesoundRhodes-000-070-a#3.mp3", "71": "../instruments/rhodes/FreesoundRhodes-000-071-h3.mp3", "72": "../instruments/rhodes/FreesoundRhodes-000-072-c4.mp3", "73": "../instruments/rhodes/FreesoundRhodes-000-073-c#4.mp3", "74": "../instruments/rhodes/FreesoundRhodes-000-074-d4.mp3", "75": "../instruments/rhodes/FreesoundRhodes-000-075-d#4.mp3", "76": "../instruments/rhodes/FreesoundRhodes-000-076-e4.mp3", "77": "../instruments/rhodes/FreesoundRhodes-000-077-f4.mp3", "78": "../instruments/rhodes/FreesoundRhodes-000-078-f#4.mp3", "79": "../instruments/rhodes/FreesoundRhodes-000-079-g4.mp3", "80": "../instruments/rhodes/FreesoundRhodes-000-080-g#4.mp3", "81": "../instruments/rhodes/FreesoundRhodes-000-081-a4.mp3", "82": "../instruments/rhodes/FreesoundRhodes-000-082-a#4.mp3", "83": "../instruments/rhodes/FreesoundRhodes-000-083-h4.mp3", "84": "../instruments/rhodes/FreesoundRhodes-000-084-c5.mp3", "85": "../instruments/rhodes/FreesoundRhodes-000-085-c#5.mp3", "86": "../instruments/rhodes/FreesoundRhodes-000-086-d5.mp3", "87": "../instruments/rhodes/FreesoundRhodes-000-087-d#5.mp3", "88": "../instruments/rhodes/FreesoundRhodes-000-088-e5.mp3", "89": "../instruments/rhodes/FreesoundRhodes-000-089-f5.mp3", "90": "../instruments/rhodes/FreesoundRhodes-000-090-f#5.mp3", "91": "../instruments/rhodes/FreesoundRhodes-000-091-g5.mp3", "92": "../instruments/rhodes/FreesoundRhodes-000-092-g#5.mp3", "93": "../instruments/rhodes/FreesoundRhodes-000-093-a5.mp3", "94": "../instruments/rhodes/FreesoundRhodes-000-094-a#5.mp3", "95": "../instruments/rhodes/FreesoundRhodes-000-095-h5.mp3", "96": "../instruments/rhodes/FreesoundRhodes-000-096-c6.mp3", "97": "../instruments/rhodes/FreesoundRhodes-000-097-c#6.mp3", "98": "../instruments/rhodes/FreesoundRhodes-000-098-d6.mp3", "99": "../instruments/rhodes/FreesoundRhodes-000-099-d#6.mp3", "100": "../instruments/rhodes/FreesoundRhodes-000-100-e6.mp3"}
    instrument.parseSampleData(rhodes).then(
      function(){
        instrument.processMIDIEvent(new MIDIEvent(0, 144, 60, 100))
        instrument.processMIDIEvent(new MIDIEvent(200, 128, 60, 0))

        instrument.processMIDIEvent(new MIDIEvent(200, 144, 61, 100))
        instrument.processMIDIEvent(new MIDIEvent(400, 128, 61, 0))

        instrument.processMIDIEvent(new MIDIEvent(400, 144, 62, 100))
        instrument.processMIDIEvent(new MIDIEvent(600, 128, 62, 0))
      }
    )

  }

/*
  let on = new MIDIEvent(0, 144, 60, 100)
  let off = new MIDIEvent(128, 128, 60, 0)
  let note = new MIDINote(on, off)


  let p = new Part('solo')
  p.addEvents(on, off)

  let p1 = p.copy()

  debugger
  buttonStart.addEventListener('click', function(){
    //console.log(note)
  })

  buttonStop.addEventListener('click', function(){
    on.midiNote = null
  })
*/
})
