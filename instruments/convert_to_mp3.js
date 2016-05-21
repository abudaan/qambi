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

getFiles(args[2])

wavFiles.forEach(function(data){
  let wavFile = data.path
  let mp3File = data.path.replace(/\.wav$/, '.mp3')
  let cmd = 'lame ' + wavFile + ' ' + mp3File
  //console.log(cmd)
  runCommand(cmd)
})

function runCommand(cmd){
  exec(cmd, function (error, stdout, stderr) {
    //console.log('SOX', error)
    //console.log(stdout)
    //console.log(stderr)
    if(error !== null){
      console.log(error)
    }
  })
}
