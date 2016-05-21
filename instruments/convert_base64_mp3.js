/*

converts base64 samples in heartbeat instrument files to separate mp3 files

*/

import fs from 'fs'
import {exec} from 'child_process'

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

let samples = json.samplepacks[0].mapping

for(let name of Object.keys(samples)){
  fs.writeFileSync(`${name}.base64`, samples[name].d)
  let cmd = `base64 -d ${name}.base64 > ${name}.mp3`
  runCommand(cmd, `${name}.base64`)
  //console.log(cmd)
}


function runCommand(cmd, base64){
  exec(cmd, function (error, stdout, stderr) {
    //console.log(error)
    //console.log(stdout)
    //console.log(stderr)
    if(error !== null){
      console.log(error)
    }
    fs.unlinkSync(base64)
  })
}


