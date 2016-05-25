import {Sample} from './sample'
import {context} from './init_audio'

export class SampleBuffer extends Sample{

  constructor(sampleData, event){
    super(sampleData, event)

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
}
