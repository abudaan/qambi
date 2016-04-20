// @ flow

let midiEventIndex = 0

export class MIDIEvent{

  constructor(ticks: number, type: number, data1: number, data2: number = -1){
    this.id = `ME_${midiEventIndex++}_${new Date().getTime()}`
    this.ticks = ticks
    this.type = type
    this.data1 = data1
    this.data2 = data2
    this.frequency = 440 * Math.pow(2, (data1 - 69) / 12)

    this._part = null
    this._track = null
    this._song = null
    //@TODO: add all other properties
  }

  copy(){
    let m = new MIDIEvent(this.ticks, this.type, this.data1, this.data2)
    return m
  }

  transpose(amount: number){ // may be better if not a public method?
    this.data1 += amount
    this.frequency = 440 * Math.pow(2, (this.data1 - 69) / 12)
  }

  move(ticks: number){
    this.ticks += ticks
    if(this.midiNote){
      this.midiNote.update()
    }
  }

  moveTo(ticks: number){
    this.ticks = ticks
    if(this.midiNote){
      this.midiNote.update()
    }
  }
}


/*
export function deleteMIDIEvent(event){
  //event.note = null
  event.note = null
  event = null
}
*/
