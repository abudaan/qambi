// @ flow

let partIndex = 0

export class Part{
  //id: string;
  constructor(settings: {name: string, trackId: string, midiEventIds: Array<string>} = {}){
    this.id = `MP_${partIndex++}_${new Date().getTime()}`;
    ({
      name: this.name = this.id,
      trackId: this.trackId = false,
      midiEventIds: this.midiEventIds = []
    } = settings)
    this.mute = false
    this._events = []
    this._eventsById = new Map()
    this._needsUpdate = false
  }

  copy(){

  }

  transpose(){

  }

  move(ticks: number){

  }

  moveTo(ticks: number){
    this._events.forEach((event) => {
      event.moveTo(ticks)
    })
    this._needsUpdate = true
  }

  addEvents(...events){

  }

  moveEvents(ticks: number, ...events){
    events.forEach((event) => {
      event.move(ticks)
    })
    this._needsUpdate = true
  }

  moveEventsTo(ticks: number, ...events){
    events.forEach((event) => {
      event.moveTo(ticks)
    })
    this._needsUpdate = true
  }

  removeEvents(...events){

  }

  findEvents(filter: string[]){

  }
}
