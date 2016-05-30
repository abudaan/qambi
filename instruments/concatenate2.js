import fs from 'fs'

let instrument = fs.readFileSync('./instruments/heartbeat/city-piano-light.json')
instrument = JSON.parse(instrument)

let instrument2 = fs.readFileSync('./instruments/heartbeat/city-piano-light2.json')
instrument2 = JSON.parse(instrument2)

let durations = fs.readFileSync('./instruments/durations.json')
durations = JSON.parse(durations)

Object.keys(instrument).forEach(key => {
  if(isNaN(key) === false){
    console.log(key, durations[instrument[key].replace('.mp3', '')])
    instrument2[key] = durations[instrument[key].replace('.mp3', '')]
  }
})

fs.writeFileSync('./instruments/heartbeat/city-piano-light2.json', JSON.stringify(instrument2))
