var fs = require('fs')
var path = require('path')
var exec = require('child_process').exec
var args = process.argv
var wavFiles = []

function getFiles(dir){
  //console.log('getFiles in dir', dir);
  var files = fs.readdirSync(dir),
    stat, ext, basename;

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

getFiles(args[2]);

wavFiles.forEach(function(data){
  var wavFile = data.path
  var mp3File = data.path.replace(/\.wav$/, '.mp3')
  var cmd = 'lame ' + wavFile + ' ' + mp3File
  //console.log(cmd);
  runCommand(cmd)
});

function runCommand(cmd){
  exec(cmd, function (error, stdout, stderr) {
    //console.log('SOX', error);
    //console.log(stdout);
    //console.log(stderr);
    if(error !== null){
      console.log(error);
    }
  })
}
