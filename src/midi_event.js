// @ flow
import {getNoteData} from './note'
import {getSettings} from './settings'

let instanceIndex = 0

export class MIDIEvent{

  constructor(ticks: number, type: number, data1: number, data2: number = -1, channel:number = 0){
    this.id = `${this.constructor.name}_${instanceIndex++}_${new Date().getTime()}`
    this.ticks = ticks
    this.data1 = data1
    this.data2 = data2
    this.pitch = getSettings().pitch

    /* test whether type is a status byte or a command: */

    // 1. the higher 4 bits of the status byte form the command
    this.type = (type >> 4) * 16
    //this.type = this.command = (type >> 4) * 16

    // 2. filter channel events
    if(this.type >= 0x80 && this.type <= 0xE0){
      // 3. get the channel number
      if(channel > 0){
        // a channel is set, this overrules the channel number in the status byte
        this.channel = channel
      }else{
        // extract the channel from the status byte: the lower 4 bits of the status byte form the channel number
        this.channel = (type & 0xF)
      }
      //this.status = this.command + this.channel
    }else{
      // 4. not a channel event, set the type and command to the value of type as provided in the constructor
      this.type = type
      //this.type = this.command = type
      this.channel = 0 // any
    }
    //console.log(type, this.type, this.command, this.status, this.channel, this.id)

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
