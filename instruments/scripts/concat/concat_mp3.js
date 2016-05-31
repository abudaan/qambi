/*
  concatenates all mp3 files in a folder
*/

import fs from 'fs'
import path from 'path'
import {exec} from 'child_process'
let args = process.argv
let mp3Files = {}
let order = JSON.parse(fs.readFileSync('./instruments/order.json'))
let durations = JSON.parse(fs.readFileSync('./instruments/durations.json'))

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
      if(ext === '.mp3'){
        basename = path.basename(p)
        basename = basename.replace(ext, '')
        mp3Files[basename] = {
          name: basename,
          path: p
        }
      }
    }
  })
}

function concatenateMP3(cb){
  let concatenate = 'sox '

  // Object.keys(durations).forEach(function(fileName){
  //   let mp3File = mp3Files[fileName].path
  //   // console.log(mp3File)
  //   concatenate += `"${mp3File}" `
  // })

  order.forEach(function(fileName){
    let mp3File = mp3Files[fileName].path
    console.log(mp3File, durations[fileName])
    concatenate += `"${mp3File}" `
  })

  concatenate += ' ./instruments/concatenated3.mp3'
  runCommand(concatenate, () => {
    console.log('done')
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
concatenateMP3()
