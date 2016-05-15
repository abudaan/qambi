import {createSample} from './sample'
import {context} from './init_audio'
import {createNote} from './note'
import {parseSamples2} from './parse_audio'
import {typeString} from './util'
import {dispatchEvent} from './eventlistener'


const ppq = 480
const bpm = 120
const playbackSpeed = 1
const millisPerTick = (1 / playbackSpeed * 60) / bpm / ppq

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
    time = time || context.currentTime + (event.ticks * millisPerTick)
    //console.log(time)

    if(event.type === 144){
      //console.log(144, ':', time, context.currentTime, event.millis)

      sampleData = this.samplesData[event.data1][event.data2];
      sample = createSample(sampleData, event)
      this.scheduledSamples[event.midiNoteId] = sample
      sample.output.connect(this.output || context.destination)
      // sample.source.onended = () => {
      //   console.log('    deleting', event.midiNoteId)
      //   delete this.scheduledSamples[event.midiNoteId]
      // }
      sample.start(time)
      //console.log('scheduling', event.id, event.midiNoteId)
      //console.log('start', event.midiNoteId)
    }else if(event.type === 128){
      //console.log(128, ':', time, context.currentTime, event.millis)
      sample = this.scheduledSamples[event.midiNoteId]
      if(typeof sample === 'undefined'){
        //console.info('sample not found for event', event.id, ' midiNote', event.midiNoteId, event)
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
        //sample.stop(time)
      }
    }else if(event.type === 176){
      // sustain pedal
      if(event.data1 === 64){
        if(event.data2 === 127){
          this.sustainPedalDown = true
          dispatchEvent({
            type: 'sustainpedal',
            data: 'down'
          })
          //console.log('sustain pedal down')
        }else if(event.data2 === 0){
          this.sustainPedalDown = false
          this.sustainedSamples.forEach((midiNoteId) => {
            sample = this.scheduledSamples[midiNoteId]
            if(sample){
              //sample.stop(time)
              sample.stop(time, () => {
                //console.log('stop', midiNoteId)
                delete this.scheduledSamples[midiNoteId]
              })
            }
          })
          //console.log('sustain pedal up', this.sustainedSamples)
          this.sustainedSamples = []
          dispatchEvent({
            type: 'sustainpedal',
            data: 'up'
          })
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

  // load and parse
  parseSampleData(data){

    return new Promise((resolve, reject) => {
      parseSamples2(data)
      .then((result) => {

        if(typeof data.release !== 'undefined'){
          this.setRelease(data.release[0], data.release[1])
          //console.log(data.release[0], data.release[1])
        }

        result.forEach((sample) => {
          let sampleData = data[sample.id]
          if(typeof sampleData === 'string'){
            sampleData = {
              buffer: sample.buffer
            }
          }else{
            sampleData.buffer = sample.buffer
          }
          sampleData.note = sample.id
          this.updateSampleData(sampleData)
        })

        resolve()
      })
    })
  }

  /*
    @param config (optional)
      {
        note: can be note name (C4) or note number (60)
        buffer: AudioBuffer
        sustain: [sustainStart, sustainEnd], // optional, in millis
        release: [releaseDuration, releaseEnvelope], // optional
        pan: panPosition // optional
        velocity: [velocityStart, velocityEnd] // optional, for multi-layered instruments
      }
  */
  updateSampleData(...data){
    data.forEach(noteData => this._updateSampleData(noteData))
  }

  _updateSampleData(data = {}){
    let {
      note,
      buffer = null,
      sustain = [null, null],
      release = [null, 'linear'],
      pan = null,
      velocity = [0, 127],
    } = data

    if(typeof note === 'undefined'){
      console.warn('please provide a notenumber or a notename')
      return
    }

    // get notenumber from notename and check if the notenumber is valid
    let n = createNote(note)
    if(n === false){
      console.warn('not a valid note id')
      return
    }
    note = n.number

    let [sustainStart, sustainEnd] = sustain
    let [releaseDuration, releaseEnvelope] = release
    let [velocityStart, velocityEnd] = velocity

    if(sustain.length !== 2){
      sustainStart = sustainEnd = null
    }

    if(releaseDuration === null){
      releaseEnvelope = null
    }

    // console.log(noteId, buffer);
    // console.log(sustainStart, sustainEnd);
    // console.log(releaseDuration, releaseEnvelope);
    // console.log(pan);
    // console.log(velocityStart, velocityEnd);


    this.samplesData[note].forEach((sampleData, i) => {
      if(i >= velocityStart && i < velocityEnd){
        if(sampleData === -1){
          sampleData = {
            id: note
          }
        }

        sampleData.buffer = buffer || sampleData.buffer
        sampleData.sustainStart = sustainStart || sampleData.sustainStart
        sampleData.sustainEnd = sustainEnd || sampleData.sustainEnd
        sampleData.releaseDuration = releaseDuration || sampleData.releaseDuration
        sampleData.releaseEnvelope = releaseEnvelope || sampleData.releaseEnvelope
        sampleData.pan = pan || sampleData.pan

        if(typeString(sampleData.releaseEnvelope) === 'array'){
          sampleData.releaseEnvelopeArray = sampleData.releaseEnvelope
          sampleData.releaseEnvelope = 'array'
        }else{
          delete sampleData.releaseEnvelopeArray
        }
        this.samplesData[note][i] = sampleData
      }
    })
    //console.log('%O', this.samplesData[note]);
  }


  // stereo spread
  setKeyScalingPanning(){
    // sets panning based on the key value, e.g. higher notes are panned more to the right and lower notes more to the left
  }

  setKeyScalingRelease(){
    // set release based on key value
  }

  /*
    @duration: milliseconds
    @envelope: linear | equal_power | array of int values
  */
  setRelease(duration: number, envelope){
    // set release for all keys, overrules values set by setKeyScalingRelease()
    this.samplesData.forEach(function(samples, i){
      samples.forEach(function(sample){
        if(sample === -1){
          sample = {
            id: i
          }
        }
        sample.releaseDuration = duration
        sample.releaseEnvelope = envelope
      })
    })
  }


  allNotesOff(){
    this.sustainedSamples = []
    if(this.sustainPedalDown === true){
      dispatchEvent({
        type: 'sustainpedal',
        data: 'up'
      })
    }
    this.sustainPedalDown = false

    Object.keys(this.scheduledSamples).forEach((sampleId) => {
      //console.log('  stopping', sampleId, this.id)
      this.scheduledSamples[sampleId].stop()
    })
    this.scheduledSamples = {}

    //console.log('allNotesOff', this.sustainedSamples.length, this.scheduledSamples)
  }
}
