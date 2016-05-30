/*
  converts all .wav files in a specific folder to .mp3 files

  the generated .mp3 files will be stored in the same folder
*/

import fs from 'fs'
import path from 'path'
import {exec} from 'child_process'
let args = process.argv
let wavFiles = []

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
        wavFiles.push({
          name: basename,
          path: p
        })
      }
    }
  })
}

function concatenateMP3(cb){
  let millis = 0
  let concatenate = 'sox '
  let i = 0

  wavFiles.forEach(function(data){
    let mp3File = data.path
    concatenate += `"${mp3File}" `
  })

  concatenate += ' ./instruments/concatenated2.mp3'
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
