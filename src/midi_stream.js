/*
  Wrapper for accessing bytes through sequential reads

  based on: https://github.com/gasman/jasmid
  adapted to work with ArrayBuffer -> Uint8Array
*/


'use strict';

const fcc = String.fromCharCode;

class MIDIStream{

  // buffer is Uint8Array
  constructor(buffer){
    this.buffer = buffer;
    this.position = 0;
  }

  /* read string or any number of bytes */
  read(length, toString = true) {
    let result;

    if(toString){
      result = '';
      for(let i = 0; i < length; i++, this.position++){
        result += fcc(this.buffer[this.position]);
      }
      return result;
    }else{
      result = [];
      for(let i = 0; i < length; i++, this.position++){
        result.push(this.buffer[this.position]);
      }
      return result;
    }
  }

  /* read a big-endian 32-bit integer */
  readInt32() {
    let result = (
      (this.buffer[this.position] << 24) +
      (this.buffer[this.position + 1] << 16) +
      (this.buffer[this.position + 2] << 8) +
      this.buffer[this.position + 3]
    );
    this.position += 4;
    return result;
  }

  /* read a big-endian 16-bit integer */
  readInt16() {
    let result = (
      (this.buffer[this.position] << 8) +
      this.buffer[this.position + 1]
    );
    this.position += 2;
    return result;
  }

  /* read an 8-bit integer */
  readInt8(signed) {
    let result = this.buffer[this.position];
    if(signed && result > 127){
      result -= 256;
    }
    this.position += 1;
    return result;
  }

  eof() {
    return this.position >= this.buffer.length;
  }

  /* read a MIDI-style letiable-length integer
    (big-endian value in groups of 7 bits,
    with top bit set to signify that another byte follows)
  */
  readVarInt() {
    let result = 0;
    while(true) {
      let b = this.readInt8();
      if (b & 0x80) {
        result += (b & 0x7f);
        result <<= 7;
      } else {
        /* b is the last byte */
        return result + b;
      }
    }
  }
}


export default function createMIDIStream(buffer){
  return new MIDIStream(buffer);
}
