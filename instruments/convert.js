/*

converts heartbeat instruments to qambi instrument files

*/

import fs from 'fs'

let args = process.argv
let json = args[2]
let name = 'congas'
//json = `/home/abudaan/workspace/heartbeat/assets/sso/strings/${name}.mp3.112.json` // violin
json = `/home/abudaan/workspace/heartbeat/assets/sso/brass/${name}.mp3.112.json` // trumpet
json = `/home/abudaan/workspace/heartbeat/assets/sso/percussion/${name}.mp3.112.json` // congas
json = JSON.parse(fs.readFileSync(json))

let instrument = json.instruments[0]
let notes = instrument.mapping
let samples = json.samplepacks[0].mapping
let result = {
  baseUrl: `http://qambi.org/samples/${name}/`,
  release: [instrument.release_duration, instrument.release_envelope]
}

console.log(json)

for(let key of Object.keys(notes)){
  let data = notes[key]
  let sample = samples[data.n]
  //sample.d -> data
  console.log(key, data.n, sample.g, Object.keys(sample), data)

  let sustain = samples[data.n].s

  if(sustain && sustain.length === 2){
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

fs.writeFileSync(`./instruments/heartbeat/${name}.json`, JSON.stringify(result))

