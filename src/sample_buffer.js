import {Sample} from './sample'
import {context} from './init_audio'

let instanceIndex = 0

export class SampleBuffer extends Sample{

  constructor(sampleData, event){
    super(sampleData, event)
    this.id = `${this.constructor.name}_${instanceIndex++}_${new Date().getTime()}`

    if(this.sampleData === -1 || typeof this.sampleData.buffer === 'undefined'){
      // create dummy source
      this.source = {
        start(){},
        stop(){},
        connect(){},
      }

    }else{
      this.source = context.createBufferSource()
      //console.log(sampleData)
      this.source.buffer = sampleData.buffer;
      //console.log(this.source.buffer)
    }
    this.output = context.createGain()
    this.volume = event.data2 / 127
    this.output.gain.value = this.volume
    this.source.connect(this.output)
    //this.output.connect(context.destination)
  }

  //@override
  start(time){
    let {sustainStart, sustainEnd, segmentStart, segmentDuration} = this.sampleData
    //console.log(sustainStart, sustainEnd, segmentStart, segmentDuration)
    if(sustainStart && sustainEnd){
      this.source.loop = true
      this.source.loopStart = sustainStart
      this.source.loopEnd = sustainEnd
    }
    if(segmentStart && segmentDuration){
      console.log(segmentStart, segmentDuration)
      this.source.start(time, segmentStart / 1000, segmentDuration / 1000)
    }else{
      this.source.start(time);
    }
  }
}
