import {Instrument} from './instrument'
import {getNoteData} from './note'
import {parseSamples} from './parse_audio'
import {typeString} from './util'
import {fetchJSON} from './fetch_helpers'
import {SampleBuffer} from './sample_buffer'


let instanceIndex = 0

export class Sampler extends Instrument{

  constructor(name: string){
    super()
    this.id = `${this.constructor.name}_${instanceIndex++}_${new Date().getTime()}`
    this.name = name || this.id
    this.clearAllSampleData()
  }

  clearAllSampleData(){
    // create a samples data object for all 128 velocity levels of all 128 notes
    this.samplesData = new Array(128).fill(-1)
    this.samplesData = this.samplesData.map(function(){
      return new Array(128).fill(-1)
    })
  }

  createSample(event){
    return new SampleBuffer(this.samplesData[event.data1][event.data2], event)
  }

  _loadJSON(data){
    if(typeof data === 'object' && typeof data.url === 'string'){
      return fetchJSON(data.url)
    }
    return Promise.resolve(data)
  }

  // load and parse
  parseSampleData(data){

    // check if we have to clear the currently loaded samples
    let clearAll = data.clearAll

    // check if we have to overrule the baseUrl of the sampels
    let baseUrl = null
    if(typeof data.baseUrl === 'string'){
      baseUrl = data.baseUrl
    }

    if(typeof data.release !== 'undefined'){
      this.setRelease(data.release[0], data.release[1])
      //console.log(1, data.release[0], data.release[1])
    }

    //return Promise.resolve()

    return new Promise((resolve, reject) => {
      this._loadJSON(data)
      .then((json) => {
        //console.log(json)
        data = json
        if(baseUrl !== null){
          json.baseUrl = baseUrl
        }
        if(typeof data.release !== 'undefined'){
          this.setRelease(data.release[0], data.release[1])
          //console.log(2, data.release[0], data.release[1])
        }
        return parseSamples(data)
      })
      .then((result) => {

        if(clearAll === true){
          this.clearAllSampleData()
        }

        if(typeof result === 'object'){

          // single concatenated sample
          if(typeof result.sample !== 'undefined'){

            let buffer = result.sample
            for(let noteId of Object.keys(data)) {

              if(
                noteId === 'sample' ||
                noteId === 'release' ||
                noteId === 'baseUrl' ||
                noteId === 'info'
              ){
                continue
              }

              let sampleData = {
                segment: data[noteId],
                note: parseInt(noteId, 10),
                buffer
              }

              this._updateSampleData(sampleData)
              //console.log(sampleData)
            }

          }else{

            for(let noteId of Object.keys(result)) {
              let buffer = result[noteId]
              let sampleData = data[noteId]


              if(typeof sampleData === 'undefined'){
                console.log('sampleData is undefined', noteId)
              }else if(typeString(buffer) === 'array'){

                //console.log(buffer, sampleData)
                sampleData.forEach((sd, i) => {
                  //console.log(noteId, buffer[i])
                  if(typeof sd === 'string'){
                    sd = {
                      buffer: buffer[i]
                    }
                  }else{
                    sd.buffer = buffer[i]
                  }
                  sd.note = parseInt(noteId, 10)
                  this._updateSampleData(sd)
                })

              }else {

                if(typeof sampleData === 'string'){
                  sampleData = {
                    buffer: buffer
                  }
                }else{
                  sampleData.buffer = buffer
                }
                sampleData.note = parseInt(noteId, 10)
                this._updateSampleData(sampleData)

              }
            }
          }

        }else{

          result.forEach((sample) => {
            let sampleData = data[sample]
            if(typeof sampleData === 'undefined'){
              console.log('sampleData is undefined', sample)
            }else {
              if(typeof sampleData === 'string'){
                sampleData = {
                  buffer: sample.buffer
                }
              }else{
                sampleData.buffer = sample.buffer
              }
              sampleData.note = sample
              this._updateSampleData(sampleData)
              //this.updateSampleData(sampleData)
            }
          })

        }
        //console.log(new Date().getTime())
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
    data.forEach(noteData => {
      // support for multi layered instruments
      //console.log(noteData, typeString(noteData))
      if(typeString(noteData) === 'array'){
        noteData.forEach(velocityLayer => {
          this._updateSampleData(velocityLayer)
        })
      }else{
        this._updateSampleData(noteData)
      }
    })
  }

  _updateSampleData(data = {}){
    //console.log(data)
    let {
      note,
      buffer = null,
      sustain = [null, null],
      segment = [null, null],
      release = [null, 'linear'], // release duration is in seconds!
      pan = null,
      velocity = [0, 127],
    } = data

    if(typeof note === 'undefined'){
      console.warn('please provide a notenumber or a notename')
      return
    }

    // get notenumber from notename and check if the notenumber is valid
    let n = getNoteData({number: note})
    if(n === false){
      console.warn('not a valid note id')
      return
    }
    note = n.number

    let [sustainStart, sustainEnd] = sustain
    let [releaseDuration, releaseEnvelope] = release
    let [segmentStart, segmentDuration] = segment
    let [velocityStart, velocityEnd] = velocity

    if(sustain.length !== 2){
      sustainStart = sustainEnd = null
    }

    if(releaseDuration === null){
      releaseEnvelope = null
    }

    // console.log(note, buffer)
    // console.log(sustainStart, sustainEnd)
    // console.log(releaseDuration, releaseEnvelope)
    // console.log(pan)
    // console.log(velocityStart, velocityEnd)


    this.samplesData[note].forEach((sampleData, i) => {
      if(i >= velocityStart && i <= velocityEnd){
        if(sampleData === -1){
          sampleData = {
            id: note
          }
        }

        sampleData.buffer = buffer || sampleData.buffer
        sampleData.sustainStart = sustainStart || sampleData.sustainStart
        sampleData.sustainEnd = sustainEnd || sampleData.sustainEnd
        sampleData.segmentStart = segmentStart || sampleData.segmentStart
        sampleData.segmentDuration = segmentDuration || sampleData.segmentDuration
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
      //console.log('%O', this.samplesData[note])
    })
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
    this.samplesData.forEach(function(samples, id){
      samples.forEach(function(sample, i){
        if(sample === -1){
          sample = {
            id: id
          }
        }
        sample.releaseDuration = duration
        sample.releaseEnvelope = envelope
        samples[i] = sample
      })
    })
    //console.log('%O', this.samplesData)
  }
}
