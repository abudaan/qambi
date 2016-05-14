import {MIDIEvent} from './midi_event'

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
    noteon.midiNote = this
    noteoff.midiNote = this
    noteon.midiNoteId = this.id
    noteoff.midiNoteId = this.id
    this.durationTicks = noteoff.ticks - noteon.ticks
    this.durationMillis = -1
  }

  copy(){
    return new MIDINote(this.noteOn.copy(), this.noteOff.copy())
  }

  update(){ // may use another name for this method
    this.durationTicks = this.noteOff.ticks - this.noteOn.ticks
  }

  transpose(amount: number): void{
    this.noteOn.transpose(amount)
    this.noteOff.transpose(amount)
  }

  move(ticks: number): void{
    this.noteOn.move(ticks)
    this.noteOff.move(ticks)
  }

  moveTo(ticks: number): void{
    this.noteOn.moveTo(ticks)
    this.noteOff.moveTo(ticks)
  }

  unregister(){
    if(this.part){
      this.part.removeEvents(this)
      this.part = null
    }
    if(this.track){
      this.track.removeEvents(this)
      this.track = null
    }
    if(this.song){
      this.song.removeEvents(this)
      this.song = null
    }
  }
}

