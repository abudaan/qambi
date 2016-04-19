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
    //@TODO: add all other properties
  }

  copy(){
    //create clone
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


let midiNoteIndex = 0

export class MIDINote{

  constructor(noteon: MIDIEvent, noteoff: MIDIEvent){
    if(noteon.type !== 144 || noteoff.type !== 128){
      console.warn('cannot create MIDINote')
      return
    }
    this.id = `MN_${midiNoteIndex++}_${new Date().getTime()}`
    this.noteOn = noteon
    this.noteOff = noteoff
    this.durationTicks = noteoff.ticks - noteon.ticks
  }

  copy(){

  }

  update(){ // may use another name for this method
    this.durationTicks = this.noteOff.ticks - this.noteOn.ticks
  }

  transpose(amount: number): void{
    this.noteOn.transpose()
    this.noteOff.transpose()
  }

  move(ticks: number): void{
    this.noteOn.move(ticks)
    this.noteOff.move(ticks)
  }

  moveTo(ticks: number): void{
    this.noteOn.moveTo(ticks)
    this.noteOff.moveTo(ticks)
  }

}

/*
export function deleteMIDIEvent(event){
  //event.note = null
  event.note = null
  event = null
}
*/
