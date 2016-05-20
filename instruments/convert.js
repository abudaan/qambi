import fs from 'fs'

let args = process.argv
let json = args[2]
json = '/home/abudaan/workspace/heartbeat/assets/sso/strings/violin.mp3.112.json'
json = JSON.parse(fs.readFileSync(json))

let instrument = json.instruments[0]
let notes = instrument.mapping
let samples = json.samplepacks[0].mapping
let result = {
  baseUrl: 'http://qambi.org/samples/violin/',
  release: [instrument.release_duration, instrument.release_envelope]
}

console.log(json)

for(let key of Object.keys(notes)){
  let data = notes[key]
  //console.log(key, data.n, samples[data.n].s)

  let sustain = samples[data.n].s

  if(sustain.length === 2){
    let sustainStart = sustain[0] / 1000 // convert to seconds
    let sustainEnd = sustain[1] / 1000
    result[key] = {
      url: data.n + '.mp3',
      sustain: [sustainStart, sustainEnd]
    }
  }else{
    result[key] = {
      url: data.n + '.mp3'
    }
  }
}

fs.writeFileSync('./instruments/heartbeat/violin.json', JSON.stringify(result))

