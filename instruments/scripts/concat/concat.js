/*

- loop over all wav file in a folder and get the duration of each wav file
- store the start and end position in millis of each wav file in the concatenated wav file
- concatenate all wav files into one big wav file
- convert the concatenated wav file to mp3

*/

import fs from 'fs'
import path from 'path'
import {exec} from 'child_process'
let args = process.argv
let samples = []
let durations = {}
let filesOrder = []

function getFiles(dir, extension){
  //console.log('getFiles in dir', dir)
  let files = fs.readdirSync(dir),
    stat, ext, basename

  files.forEach(function(p){
    p = path.resolve(dir, p)
    stat = fs.statSync(p)

    if(stat.isDirectory()){
      //getFiles(p)
    }else{
      ext = path.extname(p)
      if(ext === extension){
        basename = path.basename(p)
        basename = basename.replace(ext, '')
        samples.push({
          name: basename,
          path: p
        })
      }
    }
  })
}

function getDurations(cb){
  let millis = 0 // the 'playhead' in the concatenated file
  let concatenateCmd = 'sox ' // the command that will concatenate all sample files
  let i = 0

  samples.forEach(function(data){
    let wavFile = data.path
    let cmd = `sox --i "${wavFile}"`

    runCommand(cmd, function(stdout){

      // we need to know the order in which the wav files are read because we have to concatenate the mp3 files in the same order
      filesOrder.push(data.name)

      // get duration from the stdout
      let duration = stdout.substring(stdout.indexOf('Duration'), stdout.indexOf('File Size'))
      duration = duration.replace(/Duration[\ ]+\ :\ /, '')
      duration = duration.substring(duration.lastIndexOf(':') + 1, duration.indexOf(' ='))
      duration = duration.replace(/^0/, '')
      duration = Math.round(parseFloat(duration) * 1000)

      // store the start and end position in millis of the wav file in the concatenated wav file
      durations[data.name] = [millis, duration]

      // move the playhead
      millis += duration

      // add the current file to the concatenate command
      concatenateCmd += `"${wavFile}" `

      i++
      if(i === samples.length){
        // write the json file to disk, we need this in the script 'concatenate2.js'
        fs.writeFileSync('./instruments/scripts/concat/durations.json', JSON.stringify(durations))
        fs.writeFileSync('./instruments/scripts/concat/order.json', JSON.stringify(filesOrder))
        concatenateCmd += ' ./instruments/scripts/concat/concatenated.wav'

        // creates a wav file that is a concatenation of all wav files and converts the concatenated wav file to mp3.
        runCommand(concatenateCmd, () => {
          runCommand('lame ./instruments/scripts/concat/concatenated.wav ./instruments/scripts/concat/concatenated.mp3', () => {
            //fs.unlinkSync('concatenated.wav')
            console.log('done')
          })
        })

        cb()
      }
    })
  })
}

/*
converts an json instrument file with separate samples to a json instrument file that uses one concatenated sample with segments per note id:

orig:

{
  20: 'sample1.mp3',
  21: 'sample2.mp3',
  23: 'sample3.mp3',
  // and so on
}

result:

{
  20: [segmentStart, segmentEnd], // values in millis
  21: [segmentStart, segmentEnd], // values in millis
  23: [segmentStart, segmentEnd], // values in millis
  // and so on
}

*/
function createInstrument(){

  let instrument = JSON.parse(fs.readFileSync(instrumentPath))
  let instrument2 = {...instrument}

  Object.keys(instrument).forEach(key => {
    if(isNaN(key) === false){

      let name = instrument[key].replace(/\.(mp3|wav)/, '')
      console.log(key, name, durations[name])
      //instrument2[key] = [...durations[instrument[key].replace('.mp3', '')], instrument[key]]
      instrument2[key] = durations[name]
    }
  })

  instrument2.baseUrl = '../../instruments/scripts/concat/'
  instrument2.sample = 'concatenated.wav'

  fs.writeFileSync('./instruments/heartbeat/city-piano-light-concat.json', JSON.stringify(instrument2))
}


function runCommand(cmd, cb){
  exec(cmd, function (error, stdout, stderr) {
    //console.log('SOX', error)
    //console.log(stdout)
    //console.log(stderr)
    if(error !== null){
      console.log(error)
    }else{
      cb(stdout)
    }
  })
}

let samplePath = '/media/abudaan/Samples/heartbeat/Detunized_02092014/City Piano without Release Samples/City Piano Close Samples/'
let instrumentPath = '/home/abudaan/workspace/qambi/instruments/heartbeat/city-piano-light.json'
let sampleType = '.wav'
//let samplePath = '/home/abudaan/workspace/qambi/instruments/samples/city-piano-light'


//getFiles(args[2], '.wav')
getFiles(samplePath, sampleType)
getDurations(createInstrument)
