import {createSample} from './sample'
import {context} from './init_audio'
import {createNote, getNoteNumber} from './note'
import {checkIfBase64, base64ToBinary} from './util'
import fetch from 'isomorphic-fetch'

// local util functions
let getArrayBuffer
let decodeAudioData

export class Instrument{

  constructor(id: string, type: string){
    this.id = id
    this.type = type
    // create a samples data object for all 128 velocity levels of all 128 notes
    this.samplesData = new Array(128).fill(-1);
    this.samplesData = this.samplesData.map(function(){
      return new Array(128).fill(-1);
    });

    this.scheduledSamples = {}
    this.sustainedSamples = []
    this.sustainPedalDown = false
  }

  connect(output){
    this.output = output
  }

  processMIDIEvent(event, time){
    let sample, sampleData
    time = time || event.ticks * 0.0025
    //console.log(time)

    if(event.type === 144){
      //console.log(144, ':', time, context.currentTime, event.millis)

      sampleData = this.samplesData[event.data1][event.data2];
      sample = createSample(sampleData, event)
      this.scheduledSamples[event.midiNoteId] = sample
      sample.output.connect(this.output || context.destination)
      sample.start(time)
      //console.log('start', event.midiNoteId)
    }else if(event.type === 128){
      //console.log(128, ':', time, context.currentTime, event.millis)
      sample = this.scheduledSamples[event.midiNoteId]
      if(typeof sample === 'undefined'){
        console.error('sample not found for event', event)
        return
      }
      if(this.sustainPedalDown === true){
        //console.log(event.midiNoteId)
        this.sustainedSamples.push(event.midiNoteId)
      }else{
        sample.stop(time, () => {
          //console.log('stop', event.midiNoteId)
          delete this.scheduledSamples[event.midiNoteId]
        })
      }
    }else if(event.type === 176){
      // sustain pedal
      if(event.data1 === 64){
        if(event.data2 === 127){
          this.sustainPedalDown = true
          //console.log('sustain pedal down')
          //dispatchEvent(this.track.song, 'sustain_pedal', 'down');
        }else if(event.data2 === 0){
          this.sustainPedalDown = false
          this.sustainedSamples.forEach((midiNoteId) => {
            sample = this.scheduledSamples[midiNoteId]
            if(sample){
              sample.stop(time, () => {
                //console.log('stop', midiNoteId)
                delete this.scheduledSamples[midiNoteId]
              })
            }
          })
          //console.log('sustain pedal up', this.sustainedSamples)
          this.sustainedSamples = []
          //dispatchEvent(this.track.song, 'sustain_pedal', 'up');
          //this.stopSustain(time);
        }

      // panning
      }else if(event.data1 === 10){
        // panning is *not* exactly timed -> not possible (yet) with WebAudio
        //console.log(data2, remap(data2, 0, 127, -1, 1));
        //track.setPanning(remap(data2, 0, 127, -1, 1));

      // volume
      }else if(event.data1 === 7){
        // to be implemented
      }
    }
  }

  addSampleDatas(data){

  }

  /*
    @param noteId can be note name (C4) or note number (60)
    @param audio buffer
    @param config (optional)
      {
        sustain: [sustainStart, sustainEnd], // optional, in millis
        release: [releaseDuration, releaseEnvelope], // optional
        pan: panPosition // optional
        velocity: [velocityStart, velocityEnd] // optional, for multi-layered instruments
      }
  */


  addSampleData(noteId, data = {}){
    let {
      sustain = [false, false],
      release = [false, 'default'],
      pan = false,
      velocity = [0, 127],
    } = data

    if(typeof noteId === 'undefined'){
      console.warn('please provide a note id')
      return
    }

    let note = createNote(noteId)
    //console.log(note)
    if(note === false){
      console.warn('not a valid note id')
      return
    }
    noteId = note.number

    getArrayBuffer(data)
    .then((arrayBuffer) => {
      return decodeAudioData(arrayBuffer)
    },
    () => {
      console.log('error')
    })
    .then((audioBuffer) => {

      console.log('buffer', audioBuffer)

      let [sustainStart, sustainEnd] = sustain
      let [releaseDuration, releaseEnvelope] = release
      let [velocityStart, velocityEnd] = velocity

      if(sustain.length !== 2){
        sustainStart = sustainEnd = false
      }

      if(releaseDuration === false){
        releaseEnvelope = false
      }

      // log(sustainStart, sustainEnd);
      // log(releaseDuration, releaseEnvelope);
      // log(panPosition);
      // log(velocityStart, velocityEnd);

      this.samplesData[noteId].fill({
        n: noteId,
        d: audioBuffer,
        s1: sustainStart,
        s2: sustainEnd,
        r: releaseDuration,
        e: releaseEnvelope,
        p: pan
      }, velocityStart, velocityEnd + 1)
      //console.log(this.samplesData[noteId]);
    })
  }


  stopAllSounds(){
    //console.log('stopAllSounds')
    Object.keys(this.scheduledSamples).forEach((sampleId) => {
      this.scheduledSamples[sampleId].stop(0, () => {
        delete this.scheduledSamples[sampleId]
      })
    })
  }


  export(){
    //return json file with base64 encoded audio
  }
}


getArrayBuffer = function({
    url = null,
    base64 = null,
    buffer = null,
  } = {}){

  return new Promise((resolve, reject) => {

    if(url === null && base64 === null && buffer === null){
      console.warn('please provide a sample')
      reject()
    }else if(buffer !== null){
      if(buffer instanceof AudioBuffer === true){
        resolve(buffer)
      }else{
        console.warn('not a valid AudioBuffer instance');
        reject()
      }
    }else if(base64 !== null){
      if(checkIfBase64(base64) === true){
        let ab = base64ToBinary(base64);
        if(ab instanceof ArrayBuffer === true){
          resolve(ab)
        }else{
          reject()
        }
      }else{
        reject()
      }
    }else if(url !== null){
      resolve(url)
/*
      fetch(url)
      .then((response) => {
        return response.arrayBuffer()
      })
      .then((ab) => {
        if(ab instanceof ArrayBuffer === true){
        console.log(ab)
          resolve(ab)
        }else{
          reject()
        }
      })
      .catch(() => {
        console.warn('error')
        reject()
      })
*/
    }
  })
}

/*
decodeAudioData = function(arrayBuffer){
  return new Promise((resolve, reject) => {
    try{
      context.decodeAudioData(arrayBuffer,

        function onSuccess(buffer){
          resolve(buffer);
        },

        function onError(e){
          console.log('onerror', e)
          reject(e)
        }
      )
    }catch(e){
      console.log('catch', e)
      reject(e);
    }
  })
}
*/

let data = {
  60: {
    url: 'url/to/sample',
    // not mandatory params:
    sustain: [false, false],
    release: [false, 'default'],
    pan: false,
    velocity: [0, 127],
  },
  61: {
    buffer: 'sample as AudioBuffer'
  },
  D4: {
    base64: 'base64 encoded sample'
  },
}

