import fs from 'fs'

let gm = {
  Piano: ['1 Acoustic Grand Piano', '2 Bright Acoustic Piano', '3 Electric Grand Piano', '4 Honky-tonk Piano', '5 Electric Piano 1', '6 Electric Piano 2', '7 Harpsichord', '8 Clavinet'],
  ChromaticPercussion: ['9 Celesta', '10 Glockenspiel', '11 Music Box', '12 Vibraphone', '13 Marimba', '14 Xylophone', '15 Tubular Bells', '16 Dulcimer'],
  Organ: ['17 Drawbar Organ', '18 Percussive Organ', '19 Rock Organ', '20 Church Organ', '21 Reed Organ', '22 Accordion', '23 Harmonica', '24 Tango Accordion'],
  Guitar: ['25 Acoustic Guitar (nylon)', '26 Acoustic Guitar (steel)', '27 Electric Guitar (jazz)', '28 Electric Guitar (clean)', '29 Electric Guitar (muted)', '30 Overdriven Guitar', '31 Distortion Guitar', '32 Guitar Harmonics'],
  Bass: ['33 Acoustic Bass', '34 Electric Bass (finger)', '35 Electric Bass (pick)', '36 Fretless Bass', '37 Slap Bass 1', '38 Slap Bass 2', '39 Synth Bass 1', '40 Synth Bass 2'],
  Strings: ['41 Violin', '42 Viola', '43 Cello', '44 Contrabass', '45 Tremolo Strings', '46 Pizzicato Strings', '47 Orchestral Harp', '48 Timpani'],
  Ensemble: ['49 String Ensemble 1', '50 String Ensemble 2', '51 Synth Strings 1', '52 Synth Strings 2', '53 Choir Aahs', '54 Voice Oohs', '55 Synth Choir', '56 Orchestra Hit'],
  Brass: ['57 Trumpet', '58 Trombone', '59 Tuba', '60 Muted Trumpet', '61 French Horn', '62 Brass Section', '63 Synth Brass 1', '64 Synth Brass 2'],
  Reed: ['65 Soprano Sax', '66 Alto Sax', '67 Tenor Sax', '68 Baritone Sax', '69 Oboe', '70 English Horn', '71 Bassoon', '72 Clarinet'],
  Pipe: ['73 Piccolo', '74 Flute', '75 Recorder', '76 Pan Flute', '77 Blown Bottle', '78 Shakuhachi', '79 Whistle', '80 Ocarina'],
  SynthLead: ['81 Lead 1 (square)', '82 Lead 2 (sawtooth)', '83 Lead 3 (calliope)', '84 Lead 4 (chiff)', '85 Lead 5 (charang)', '86 Lead 6 (voice)', '87 Lead 7 (fifths)', '88 Lead 8 (bass + lead)'],
  SynthPad: ['89 Pad 1 (new age)', '90 Pad 2 (warm)', '91 Pad 3 (polysynth)', '92 Pad 4 (choir)', '93 Pad 5 (bowed)', '94 Pad 6 (metallic)', '95 Pad 7 (halo)', '96 Pad 8 (sweep)'],
  SynthEffects: ['97 FX 1 (rain)', '98 FX 2 (soundtrack)', '99 FX 3 (crystal)', '100 FX 4 (atmosphere)', '101 FX 5 (brightness)', '102 FX 6 (goblins)', '103 FX 7 (echoes)', '104 FX 8 (sci-fi)'],
  Ethnic: ['105 Sitar', '106 Banjo', '107 Shamisen', '108 Koto', '109 Kalimba', '110 Bagpipe', '111 Fiddle', '112 Shanai'],
  Percussive: ['113 Tinkle Bell', '114 Agogo', '115 Steel Drums', '116 Woodblock', '117 Taiko Drum', '118 Melodic Tom', '119 Synth Drum'],
  Soundeffects: ['120 Reverse Cymbal', '121 Guitar Fret Noise', '122 Breath Noise', '123 Seashore', '124 Bird Tweet', '125 Telephone Ring', '126 Helicopter', '127 Applause', '128 Gunshot']
}


let template = {
  baseUrl: '',
  release: [4, 'equal power'],
  21: 'A0.mp3',
  22: 'Bb0.mp3',
  23: 'B0.mp3',
  24: 'C1.mp3',
  25: 'Db1.mp3',
  26: 'D1.mp3',
  27: 'Eb1.mp3',
  28: 'E1.mp3',
  29: 'F1.mp3',
  30: 'Gb1.mp3',
  31: 'G1.mp3',
  32: 'Ab1.mp3',
  33: 'A1.mp3',
  34: 'Bb1.mp3',
  35: 'B1.mp3',
  36: 'C2.mp3',
  37: 'Db2.mp3',
  38: 'D2.mp3',
  39: 'Eb2.mp3',
  40: 'E2.mp3',
  41: 'F2.mp3',
  42: 'Gb2.mp3',
  43: 'G2.mp3',
  44: 'Ab2.mp3',
  45: 'A2.mp3',
  46: 'Bb2.mp3',
  47: 'B2.mp3',
  48: 'C3.mp3',
  49: 'Db3.mp3',
  50: 'D3.mp3',
  51: 'Eb3.mp3',
  52: 'E3.mp3',
  53: 'F3.mp3',
  54: 'Gb3.mp3',
  55: 'G3.mp3',
  56: 'Ab3.mp3',
  57: 'A3.mp3',
  58: 'Bb3.mp3',
  59: 'B3.mp3',
  60: 'C4.mp3',
  61: 'Db4.mp3',
  62: 'D4.mp3',
  63: 'Eb4.mp3',
  64: 'E4.mp3',
  65: 'F4.mp3',
  66: 'Gb4.mp3',
  67: 'G4.mp3',
  68: 'Ab4.mp3',
  69: 'A4.mp3',
  70: 'Bb4.mp3',
  71: 'B4.mp3',
  72: 'C5.mp3',
  73: 'Db5.mp3',
  74: 'D5.mp3',
  75: 'Eb5.mp3',
  76: 'E5.mp3',
  77: 'F5.mp3',
  78: 'Gb5.mp3',
  79: 'G5.mp3',
  80: 'Ab5.mp3',
  81: 'A5.mp3',
  82: 'Bb5.mp3',
  83: 'B5.mp3',
  84: 'C6.mp3',
  85: 'Db6.mp3',
  86: 'D6.mp3',
  87: 'Eb6.mp3',
  88: 'E6.mp3',
  89: 'F6.mp3',
  90: 'Gb6.mp3',
  91: 'G6.mp3',
  92: 'Ab6.mp3',
  93: 'A6.mp3',
  94: 'Bb6.mp3',
  95: 'B6.mp3',
  96: 'C7.mp3',
  97: 'Db7.mp3',
  98: 'D7.mp3',
  99: 'Eb7.mp3',
  100: 'E7.mp3',
  101: 'F7.mp3',
  102: 'Gb7.mp3',
  103: 'G7.mp3',
  104: 'Ab7.mp3',
  105: 'A7.mp3',
  106: 'Bb7.mp3',
  107: 'B7.mp3',
  108: 'C8.mp3'
}


for(let key of Object.keys(gm)){
  let group = gm[key]
  group.forEach(name => {
    name = name.toLowerCase()
    name = name.replace(/[0-9]{1,}\ /, '')
    name = name.replace(/\ /g, '_')
    name = name.replace(/[\(\)\+\-]/g, '')
    //console.log(name)
    let baseUrl = `https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/master/FluidR3_GM/${name}-mp3/`
    let instrument = Object.assign({}, template)
    instrument.baseUrl = baseUrl
    fs.writeFileSync(`./instruments/fluidsynth/${name}.json`, JSON.stringify(instrument))
  })
}


