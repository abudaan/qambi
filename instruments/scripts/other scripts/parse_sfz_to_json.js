var
  fs = require('fs'),
  parse = require('./sfz2json').parse,
  args = process.argv;


var json = parse(args[2]);
fs.writeFileSync('/home/abudaan/workspace/qambi-instruments/test.json', JSON.stringify(json))

// node sfz2json.js /media/abudaan/Samples/heartbeat/Detunized_02092014/CK-IceSkates/CK-IceSkates.sfz