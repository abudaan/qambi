/*

converts heartbeat instruments to qambi instrument files

*/

import fs from 'fs'

let args = process.argv
let json = args[2]
let name = 'city-piano'
let multilayered = true
//json = '/home/abudaan/workspace/heartbeat/assets/sso/strings/violin.mp3.112.json'
//json = '/home/abudaan/workspace/heartbeat/assets/sso/brass/trumpet.mp3.112.json'
//json = '/home/abudaan/workspace/heartbeat/assets/detunized/ck-iceskates.mp3.128.json'
//json = '/home/abudaan/workspace/heartbeat/assets/detunized/shk2-squareroot.mp3.128.json'
json = '/home/abudaan/workspace/heartbeat/assets/city-piano/city-piano-velocity-layers.mp3.128.json'

json = JSON.parse(fs.readFileSync(json))

let instrument = json.instruments[0]
let notes = instrument.mapping
let samples = json.samplepacks[0].mapping
let result = {
  baseUrl: `https://raw.githubusercontent.com/abudaan/qambi/gh-pages/instruments/samples/${name}/`,
  release: [instrument.release_duration, instrument.release_envelope],
  info: {
    name: 'City Piano',
    url: 'http://detunized.com',
    keyrange: instrument.keyrange,
    velocityLayers: '0-48, 49-96, 97-110, 111-127',
    description: 'sampled from Baldwin piano'
  }
}

// get an overview of the JSON file
console.log(json)
//console.log(instrument.keyrange)

if(multilayered){
  for(let key of Object.keys(notes)){
    let note = notes[key]

    //console.log(key) // notenumber
    result[key] = []

    note.forEach(n => {

      //console.log(n.n, n.v) // get name and velocity layer
      //console.log(samples[n.n].s) // get sustain loop

      //let sustainLoop = samples[n.n].s
      result[key].push({
        url: n.n + '.mp3',
        velocity: n.v,
        //sustain: [sustainLoop[0] / 1000, sustainLoop[1] / 1000]
      })
    })
  }

  //console.log(Object.keys(samples))

}else{

  for(let key of Object.keys(notes)){
    let data = notes[key]
    let sample = samples[key]
    //sample.d -> data
    console.log(key, data.n, Object.keys(sample), data)

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

}

fs.writeFileSync(`./instruments/heartbeat/${name}.json`, JSON.stringify(result))

