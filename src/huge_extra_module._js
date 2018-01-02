import React, { PropTypes } from 'react';
import R from 'ramda';
import audio from '../misc/piano_basic.mp3.json';
import { base64ToBinary } from '../util/convert';


/*
// adapted version of https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js
const base64ToBinary = (argInput) => {
    const keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    let bytes = Math.ceil((3 * argInput.length) / 4.0);
    const buffer = new ArrayBuffer(bytes);
    const uarray = new Uint8Array(buffer);

    const lkey1 = keyStr.indexOf(argInput.charAt(argInput.length - 1));
    const lkey2 = keyStr.indexOf(argInput.charAt(argInput.length - 1));
    if (lkey1 === 64) { bytes -= 1; } // padding chars, so skip
    if (lkey2 === 64) { bytes -= 1; } // padding chars, so skip

    const input = argInput.replace(/[^A-Za-z0-9+/=]/g, '');

    let j = 0;
    let enc1;
    let enc2;
    let enc3;
    let enc4;
    let chr1;
    let chr2;
    let chr3;
    for (let i = 0; i < bytes; i += 3) {
        // get the 3 octects in 4 ascii chars
        enc1 = keyStr.indexOf(input.charAt(j += 1));
        enc2 = keyStr.indexOf(input.charAt(j += 1));
        enc3 = keyStr.indexOf(input.charAt(j += 1));
        enc4 = keyStr.indexOf(input.charAt(j += 1));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        uarray[i] = chr1;
        if (enc3 !== 64) { uarray[i + 1] = chr2; }
        if (enc4 !== 64) { uarray[i + 2] = chr3; }
    }
    // console.log(buffer);
    return buffer;
};
*/


const base64ToBinary = (input) => {
  let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
    bytes, uarray, buffer,
    lkey1, lkey2,
    chr1, chr2, chr3,
    enc1, enc2, enc3, enc4,
    i, j = 0;

  bytes = Math.ceil((3 * input.length) / 4.0);
  buffer = new ArrayBuffer(bytes);
  uarray = new Uint8Array(buffer);

  lkey1 = keyStr.indexOf(input.charAt(input.length - 1));
  lkey2 = keyStr.indexOf(input.charAt(input.length - 1));
  if(lkey1 == 64) bytes--; //padding chars, so skip
  if(lkey2 == 64) bytes--; //padding chars, so skip

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

  for(i = 0; i < bytes; i += 3) {
    //get the 3 octects in 4 ascii chars
    enc1 = keyStr.indexOf(input.charAt(j++));
    enc2 = keyStr.indexOf(input.charAt(j++));
    enc3 = keyStr.indexOf(input.charAt(j++));
    enc4 = keyStr.indexOf(input.charAt(j++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    uarray[i] = chr1;
    if(enc3 != 64) uarray[i+1] = chr2;
    if(enc4 != 64) uarray[i+2] = chr3;
  }
  //console.log(buffer);
  return buffer;
}


let ctx;
const AudioContext = global.window.AudioContext || global.window.webkitAudioContext;
if (typeof AudioContext !== 'undefined') {
    ctx = new AudioContext();
}

const decode = arrayBuffer => new Promise((resolve, reject) => {
    ctx.decodeAudioData(
        arrayBuffer,
        buffer => resolve(buffer),
        error => reject(error),
    );
});

const getRandomSample = (data) => {
    const base64Samples = data.samplepacks[0].mapping;
    const keys = R.keys(base64Samples);
    const buffers = R.map(key => base64ToBinary(base64Samples[key]), keys);
    const promises = R.map(b => decode(b), buffers);
    Promise.all(promises)
    .then((samples) => {
        const random = Math.floor(Math.random() * R.length(keys)) + 1;
        const source = ctx.createBufferSource();
        source.buffer = samples[random];
        source.connect(ctx.destination);
        source.start(0);
    });
};

const Huge = (props) => {
    getRandomSample(audio);
    return <pre>*pling!*</pre>;
};

Huge.propTypes = {
    // name: PropTypes.string.isRequired,
    // path: PropTypes.string.isRequired,
    // label: PropTypes.string.isRequired,
};

export default Huge;
