import {createSample} from './sample'
import {context} from './init_audio'
import {createNote, getNoteNumber} from './note'

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
    console.log(time)

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
            this.scheduledSamples[midiNoteId].stop(time, () => {
              //console.log('stop', midiNoteId)
              delete this.scheduledSamples[midiNoteId]
            })
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
  addSampleData(noteId, audioBuffer,
    {
      sustain = [false, false],
      release = [false, 'default'],
      pan = false,
      velocity = [0, 127]
    } = {}){

    if(audioBuffer instanceof AudioBuffer === false){
      console.warn('not a valid AudioBuffer instance');
      return;
    }

    let [sustainStart, sustainEnd] = sustain;
    let [releaseDuration, releaseEnvelope] = release;
    let [velocityStart, velocityEnd] = velocity;

    if(sustain.length !== 2){
      sustainStart = sustainEnd = false;
    }

    if(releaseDuration === false){
      releaseEnvelope = false;
    }

    // log(sustainStart, sustainEnd);
    // log(releaseDuration, releaseEnvelope);
    // log(panPosition);
    // log(velocityStart, velocityEnd);

    let note = createNote(noteId)
    console.log(note)
    if(note === false){
      return
    }
    noteId = note.number;

    this.samplesData[noteId].fill({
      n: noteId,
      d: audioBuffer,
      s1: sustainStart,
      s2: sustainEnd,
      r: releaseDuration,
      e: releaseEnvelope,
      p: pan
    }, velocityStart, velocityEnd + 1);

    //console.log(this.samplesData[noteId]);
  }


  stopAllSounds(){
    console.log('stopAllSounds')
    Object.keys(this.scheduledSamples).forEach((sampleId) => {
      this.scheduledSamples[sampleId].stop(0, () => {
        delete this.scheduledSamples[sampleId]
      })
    })
  }
}

