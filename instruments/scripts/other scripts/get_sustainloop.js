'use strict';

var
    fs = require('fs'),
    path = require('path'),
    args = process.argv,
    getSustainLoop= require('./read_wave').getSustainLoop,
    wavFiles = [];


function getFiles(dir){
    //console.log('getFiles in dir', dir);
    var files = fs.readdirSync(dir),
        stat, ext, basename;

    files.forEach(function(p){
        p = path.resolve(dir, p);
        stat = fs.statSync(p);

        if(stat.isDirectory()){
            getFiles(p);
        }else{
            ext = path.extname(p);
            if(ext === '.wav'){
                basename = path.basename(p);
                basename = basename.replace(ext, '');
                wavFiles.push({
                    name: basename,
                    path: p
                });
            }
        }
    });
}

getFiles(args[2]);

wavFiles.forEach(function(data){
    console.log(data.name, '->', getSustainLoop(data.path));
});


// node get_sustainloop.js /media/abudaan/Samples/heartbeat/Detunized_02092014/CK-IceSkates/
