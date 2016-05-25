import {Sample} from './sample'
import {context} from './init_audio'

let instanceIndex = 0

export class SampleOscillator extends Sample{

  constructor(sampleData, event){
    super(sampleData, event)
    this.id = `${this.constructor.name}_${instanceIndex++}_${new Date().getTime()}`

    if(this.sampleData === -1){
      // create dummy source
      this.source = {
        start(){},
        stop(){},
        connect(){},
      }

    }else{

      // @TODO add type 'custom' => PeriodicWave
      let type = this.sampleData.type
      this.source = context.createOscillator()

      switch(type){
        case 'sine':
        case 'square':
        case 'sawtooth':
        case 'triangle':
          this.source.type = type
          break
        default:
          this.source.type = 'square'
      }
      this.source.frequency.value = event.frequency
    }
    this.output = context.createGain()
    this.volume = event.data2 / 127
    this.output.gain.value = this.volume
    this.source.connect(this.output)
    //this.output.connect(context.destination)
  }
}
