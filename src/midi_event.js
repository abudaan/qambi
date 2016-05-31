// @ flow
import {getNoteData} from './note'
import {getSettings} from './settings'

let instanceIndex = 0

export class MIDIEvent{

  constructor(ticks: number, type: number, data1: number, data2: number = -1, channel:number = 0){
    this.id = `${this.constructor.name}_${instanceIndex++}_${new Date().getTime()}`
    this.ticks = ticks
    this.type = type
    this.data1 = data1
    this.data2 = data2
    this.pitch = getSettings().pitch

    // sometimes NOTE_OFF events are sent as NOTE_ON events with a 0 velocity value
    if(type === 144 && data2 === 0){
      this.type = 128
    }

    this._part = null
    this._track = null
    this._song = null

    if(type === 144 || type === 128){
      ({
        name: this.noteName,
        fullName: this.fullNoteName,
        frequency: this.frequency,
        octave: this.octave
      } = getNoteData({number: data1}))
    }
    //@TODO: add all other properties
  }

  copy(){
    let m = new MIDIEvent(this.ticks, this.type, this.data1, this.data2)
    return m
  }

  transpose(amount: number){ // may be better if not a public method?
    this.data1 += amount
    this.frequency = this.pitch * Math.pow(2, (this.data1 - 69) / 12)
  }

  updatePitch(newPitch){
    if(newPitch === this.pitch){
      return
    }
    this.pitch = newPitch
    this.transpose(0)
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
