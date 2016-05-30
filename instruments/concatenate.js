/*
  converts all .wav files in a specific folder to .mp3 files

  the generated .mp3 files will be stored in the same folder
*/

import fs from 'fs'
import path from 'path'
import {exec} from 'child_process'
let args = process.argv
let wavFiles = []
let json = {}

function getFiles(dir){
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
      if(ext === '.wav'){
        basename = path.basename(p)
        basename = basename.replace(ext, '')
        wavFiles.push({
          name: basename,
          path: p
        })
      }
    }
  })
}

function getDurations(cb){
  let millis = 0
  let concatenate = 'sox '
  let i = 0

  wavFiles.forEach(function(data){
    let wavFile = data.path
    let mp3File = data.path.replace(/\.wav$/, '.mp3')
    //let cmd = `lame "${wavFile}" "${mp3File}"`
    let cmd = `sox --i "${wavFile}"`

    //console.log(cmd)
    runCommand(cmd, function(stdout){
      // get duration
      let tmp = stdout.substring(stdout.indexOf('Duration'), stdout.indexOf('File Size'))
      tmp = tmp.replace(/Duration[\ ]+\ :\ /, '')
      tmp = tmp.substring(tmp.lastIndexOf(':') + 1, tmp.indexOf(' ='))
      tmp = tmp.replace(/^0/, '')
      tmp = Math.round(parseFloat(tmp) * 1000)
      json[data.name] = [millis, millis + tmp]
      //console.log(data.name, millis, millis + tmp)
      millis += tmp

      concatenate += `"${wavFile}" `

      i++
      if(i === wavFiles.length){
        fs.writeFileSync('./instruments/durations.json', JSON.stringify(json))
        concatenate += ' ,.instruments/concatenated.mp3'
        runCommand(concatenate, () => {
          //runCommand('lame concatenated.wav ./instruments/samples/city-piano-light/city-piano-light-concatenated.mp3', () => {
          //  fs.unlinkSync('concatenated.wav')
            console.log('done')
          //})
        })
      }
    })
  })
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


getFiles(args[2])
getDurations()
