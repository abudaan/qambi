//import gmInstruments from './gm_instruments'

//const params = ['ppq', 'bpm', 'bars', 'pitch', 'bufferTime', 'lowestNote', 'highestNote', 'noteNameMode', 'nominator', 'denominator', 'quantizeValue', 'fixedLengthValue', 'positionType', 'useMetronome', 'autoSize', 'playbackSpeed', 'autoQuantize', ]

let settings = {
  ppq: 960,
  bpm: 120,
  bars: 16,
  pitch: 440,
  bufferTime: 200,
  lowestNote: 0,
  highestNote: 127,
  noteNameMode: 'sharp',
  nominator: 4,
  denominator: 4,
  quantizeValue: 8,
  fixedLengthValue: false,
  positionType: 'all',
  useMetronome: false,
  autoSize: true,
  playbackSpeed: 1,
  autoQuantize: false,
  volume: 0.5,
}


export function updateSettings(data){
  ({
    ppq: settings.ppq = settings.ppq,
    bpm: settings.bpm = settings.bpm,
    bars: settings.bars = settings.bars,
    pitch: settings.pitch = settings.pitch,
    bufferTime: settings.bufferTime = settings.bufferTime,
    lowestNote: settings.lowestNote = settings.lowestNote,
    highestNote: settings.highestNote = settings.highestNote,
    noteNameMode: settings.noteNameMode = settings.noteNameMode,
    nominator: settings.nominator = settings.nominator,
    denominator: settings.denominator = settings.denominator,
    quantizeValue: settings.quantizeValue = settings.quantizeValue,
    fixedLengthValue: settings.fixedLengthValue = settings.fixedLengthValue,
    positionType: settings.positionType = settings.positionType,
    useMetronome: settings.useMetronome = settings.useMetronome,
    autoSize: settings.autoSize = settings.autoSize,
    playbackSpeed: settings.playbackSpeed = settings.playbackSpeed,
    autoQuantize: settings.autoQuantize = settings.autoQuantize,
    volume: settings.volume = settings.volume,
  } = data)

  console.log('settings: %O', settings)
}


export function getSettings(...params){
  return {...settings}
/*
  let result = {}
  params.forEach(param => {
    switch(param){
      case 'pitch':
        result.pitch = pitch
        break
      case 'noteNameMode':
        result.noteNameMode = noteNameMode
        break
      case 'bufferTime':
        result.bufferTime = bufferTime
        break
      case 'ppq':
        result.ppq = ppq
        break
      default:
        // do nothing
    }
  })
  return result
*/
}


//ported heartbeat instruments: http://github.com/abudaan/heartbeat
const heartbeatInstruments = new Map([
  ['city-piano', {
    name: 'City Piano (piano)',
    description: 'City Piano uses samples from a Baldwin piano, it has 4 velocity layers: 1 - 48, 49 - 96, 97 - 110 and 110 - 127. In total it uses 4 * 88 = 352 samples',
  }],
  ['city-piano-light', {
    name: 'City Piano Light (piano)',
    description: 'City Piano light uses samples from a Baldwin piano, it has only 1 velocity layer and uses 88 samples',
  }],
  ['ck-iceskates', {
    name: 'CK Ice Skates (synth)',
    description: 'uses Detunized samples',
  }],
  ['shk2-squareroot', {
    name: 'SHK2 squareroot (synth)',
    description: 'uses Detunized samples',
  }],
  ['rhodes', {
    name: 'Rhodes (piano)',
    description: 'uses Freesound samples',
  }],
  ['rhodes2', {
    name: 'Rhodes 2 (piano)',
    description: 'uses Detunized samples',
  }],
  ['trumpet', {
    name: 'Trumpet (brass)',
    description: 'uses SSO samples',
  }],
  ['violin', {
    name: 'Violin (strings)',
    description: 'uses SSO samples',
  }]
])
export const getInstruments = function(){
  return heartbeatInstruments
}

// gm sounds exported from FluidSynth by Benjamin Gleitzman: https://github.com/gleitz/midi-js-soundfonts
const gmInstruments = {"acoustic_grand_piano":{"name":"1 Acoustic Grand Piano (piano)","description":"Fluidsynth samples"},"bright_acoustic_piano":{"name":"2 Bright Acoustic Piano (piano)","description":"Fluidsynth samples"},"electric_grand_piano":{"name":"3 Electric Grand Piano (piano)","description":"Fluidsynth samples"},"honkytonk_piano":{"name":"4 Honky-tonk Piano (piano)","description":"Fluidsynth samples"},"electric_piano_1":{"name":"5 Electric Piano 1 (piano)","description":"Fluidsynth samples"},"electric_piano_2":{"name":"6 Electric Piano 2 (piano)","description":"Fluidsynth samples"},"harpsichord":{"name":"7 Harpsichord (piano)","description":"Fluidsynth samples"},"clavinet":{"name":"8 Clavinet (piano)","description":"Fluidsynth samples"},"celesta":{"name":"9 Celesta (chromaticpercussion)","description":"Fluidsynth samples"},"glockenspiel":{"name":"10 Glockenspiel (chromaticpercussion)","description":"Fluidsynth samples"},"music_box":{"name":"11 Music Box (chromaticpercussion)","description":"Fluidsynth samples"},"vibraphone":{"name":"12 Vibraphone (chromaticpercussion)","description":"Fluidsynth samples"},"marimba":{"name":"13 Marimba (chromaticpercussion)","description":"Fluidsynth samples"},"xylophone":{"name":"14 Xylophone (chromaticpercussion)","description":"Fluidsynth samples"},"tubular_bells":{"name":"15 Tubular Bells (chromaticpercussion)","description":"Fluidsynth samples"},"dulcimer":{"name":"16 Dulcimer (chromaticpercussion)","description":"Fluidsynth samples"},"drawbar_organ":{"name":"17 Drawbar Organ (organ)","description":"Fluidsynth samples"},"percussive_organ":{"name":"18 Percussive Organ (organ)","description":"Fluidsynth samples"},"rock_organ":{"name":"19 Rock Organ (organ)","description":"Fluidsynth samples"},"church_organ":{"name":"20 Church Organ (organ)","description":"Fluidsynth samples"},"reed_organ":{"name":"21 Reed Organ (organ)","description":"Fluidsynth samples"},"accordion":{"name":"22 Accordion (organ)","description":"Fluidsynth samples"},"harmonica":{"name":"23 Harmonica (organ)","description":"Fluidsynth samples"},"tango_accordion":{"name":"24 Tango Accordion (organ)","description":"Fluidsynth samples"},"acoustic_guitar_nylon":{"name":"25 Acoustic Guitar (nylon) (guitar)","description":"Fluidsynth samples"},"acoustic_guitar_steel":{"name":"26 Acoustic Guitar (steel) (guitar)","description":"Fluidsynth samples"},"electric_guitar_jazz":{"name":"27 Electric Guitar (jazz) (guitar)","description":"Fluidsynth samples"},"electric_guitar_clean":{"name":"28 Electric Guitar (clean) (guitar)","description":"Fluidsynth samples"},"electric_guitar_muted":{"name":"29 Electric Guitar (muted) (guitar)","description":"Fluidsynth samples"},"overdriven_guitar":{"name":"30 Overdriven Guitar (guitar)","description":"Fluidsynth samples"},"distortion_guitar":{"name":"31 Distortion Guitar (guitar)","description":"Fluidsynth samples"},"guitar_harmonics":{"name":"32 Guitar Harmonics (guitar)","description":"Fluidsynth samples"},"acoustic_bass":{"name":"33 Acoustic Bass (bass)","description":"Fluidsynth samples"},"electric_bass_finger":{"name":"34 Electric Bass (finger) (bass)","description":"Fluidsynth samples"},"electric_bass_pick":{"name":"35 Electric Bass (pick) (bass)","description":"Fluidsynth samples"},"fretless_bass":{"name":"36 Fretless Bass (bass)","description":"Fluidsynth samples"},"slap_bass_1":{"name":"37 Slap Bass 1 (bass)","description":"Fluidsynth samples"},"slap_bass_2":{"name":"38 Slap Bass 2 (bass)","description":"Fluidsynth samples"},"synth_bass_1":{"name":"39 Synth Bass 1 (bass)","description":"Fluidsynth samples"},"synth_bass_2":{"name":"40 Synth Bass 2 (bass)","description":"Fluidsynth samples"},"violin":{"name":"41 Violin (strings)","description":"Fluidsynth samples"},"viola":{"name":"42 Viola (strings)","description":"Fluidsynth samples"},"cello":{"name":"43 Cello (strings)","description":"Fluidsynth samples"},"contrabass":{"name":"44 Contrabass (strings)","description":"Fluidsynth samples"},"tremolo_strings":{"name":"45 Tremolo Strings (strings)","description":"Fluidsynth samples"},"pizzicato_strings":{"name":"46 Pizzicato Strings (strings)","description":"Fluidsynth samples"},"orchestral_harp":{"name":"47 Orchestral Harp (strings)","description":"Fluidsynth samples"},"timpani":{"name":"48 Timpani (strings)","description":"Fluidsynth samples"},"string_ensemble_1":{"name":"49 String Ensemble 1 (ensemble)","description":"Fluidsynth samples"},"string_ensemble_2":{"name":"50 String Ensemble 2 (ensemble)","description":"Fluidsynth samples"},"synth_strings_1":{"name":"51 Synth Strings 1 (ensemble)","description":"Fluidsynth samples"},"synth_strings_2":{"name":"52 Synth Strings 2 (ensemble)","description":"Fluidsynth samples"},"choir_aahs":{"name":"53 Choir Aahs (ensemble)","description":"Fluidsynth samples"},"voice_oohs":{"name":"54 Voice Oohs (ensemble)","description":"Fluidsynth samples"},"synth_choir":{"name":"55 Synth Choir (ensemble)","description":"Fluidsynth samples"},"orchestra_hit":{"name":"56 Orchestra Hit (ensemble)","description":"Fluidsynth samples"},"trumpet":{"name":"57 Trumpet (brass)","description":"Fluidsynth samples"},"trombone":{"name":"58 Trombone (brass)","description":"Fluidsynth samples"},"tuba":{"name":"59 Tuba (brass)","description":"Fluidsynth samples"},"muted_trumpet":{"name":"60 Muted Trumpet (brass)","description":"Fluidsynth samples"},"french_horn":{"name":"61 French Horn (brass)","description":"Fluidsynth samples"},"brass_section":{"name":"62 Brass Section (brass)","description":"Fluidsynth samples"},"synth_brass_1":{"name":"63 Synth Brass 1 (brass)","description":"Fluidsynth samples"},"synth_brass_2":{"name":"64 Synth Brass 2 (brass)","description":"Fluidsynth samples"},"soprano_sax":{"name":"65 Soprano Sax (reed)","description":"Fluidsynth samples"},"alto_sax":{"name":"66 Alto Sax (reed)","description":"Fluidsynth samples"},"tenor_sax":{"name":"67 Tenor Sax (reed)","description":"Fluidsynth samples"},"baritone_sax":{"name":"68 Baritone Sax (reed)","description":"Fluidsynth samples"},"oboe":{"name":"69 Oboe (reed)","description":"Fluidsynth samples"},"english_horn":{"name":"70 English Horn (reed)","description":"Fluidsynth samples"},"bassoon":{"name":"71 Bassoon (reed)","description":"Fluidsynth samples"},"clarinet":{"name":"72 Clarinet (reed)","description":"Fluidsynth samples"},"piccolo":{"name":"73 Piccolo (pipe)","description":"Fluidsynth samples"},"flute":{"name":"74 Flute (pipe)","description":"Fluidsynth samples"},"recorder":{"name":"75 Recorder (pipe)","description":"Fluidsynth samples"},"pan_flute":{"name":"76 Pan Flute (pipe)","description":"Fluidsynth samples"},"blown_bottle":{"name":"77 Blown Bottle (pipe)","description":"Fluidsynth samples"},"shakuhachi":{"name":"78 Shakuhachi (pipe)","description":"Fluidsynth samples"},"whistle":{"name":"79 Whistle (pipe)","description":"Fluidsynth samples"},"ocarina":{"name":"80 Ocarina (pipe)","description":"Fluidsynth samples"},"lead_1_square":{"name":"81 Lead 1 (square) (synthlead)","description":"Fluidsynth samples"},"lead_2_sawtooth":{"name":"82 Lead 2 (sawtooth) (synthlead)","description":"Fluidsynth samples"},"lead_3_calliope":{"name":"83 Lead 3 (calliope) (synthlead)","description":"Fluidsynth samples"},"lead_4_chiff":{"name":"84 Lead 4 (chiff) (synthlead)","description":"Fluidsynth samples"},"lead_5_charang":{"name":"85 Lead 5 (charang) (synthlead)","description":"Fluidsynth samples"},"lead_6_voice":{"name":"86 Lead 6 (voice) (synthlead)","description":"Fluidsynth samples"},"lead_7_fifths":{"name":"87 Lead 7 (fifths) (synthlead)","description":"Fluidsynth samples"},"lead_8_bass__lead":{"name":"88 Lead 8 (bass + lead) (synthlead)","description":"Fluidsynth samples"},"pad_1_new_age":{"name":"89 Pad 1 (new age) (synthpad)","description":"Fluidsynth samples"},"pad_2_warm":{"name":"90 Pad 2 (warm) (synthpad)","description":"Fluidsynth samples"},"pad_3_polysynth":{"name":"91 Pad 3 (polysynth) (synthpad)","description":"Fluidsynth samples"},"pad_4_choir":{"name":"92 Pad 4 (choir) (synthpad)","description":"Fluidsynth samples"},"pad_5_bowed":{"name":"93 Pad 5 (bowed) (synthpad)","description":"Fluidsynth samples"},"pad_6_metallic":{"name":"94 Pad 6 (metallic) (synthpad)","description":"Fluidsynth samples"},"pad_7_halo":{"name":"95 Pad 7 (halo) (synthpad)","description":"Fluidsynth samples"},"pad_8_sweep":{"name":"96 Pad 8 (sweep) (synthpad)","description":"Fluidsynth samples"},"fx_1_rain":{"name":"97 FX 1 (rain) (syntheffects)","description":"Fluidsynth samples"},"fx_2_soundtrack":{"name":"98 FX 2 (soundtrack) (syntheffects)","description":"Fluidsynth samples"},"fx_3_crystal":{"name":"99 FX 3 (crystal) (syntheffects)","description":"Fluidsynth samples"},"fx_4_atmosphere":{"name":"100 FX 4 (atmosphere) (syntheffects)","description":"Fluidsynth samples"},"fx_5_brightness":{"name":"101 FX 5 (brightness) (syntheffects)","description":"Fluidsynth samples"},"fx_6_goblins":{"name":"102 FX 6 (goblins) (syntheffects)","description":"Fluidsynth samples"},"fx_7_echoes":{"name":"103 FX 7 (echoes) (syntheffects)","description":"Fluidsynth samples"},"fx_8_scifi":{"name":"104 FX 8 (sci-fi) (syntheffects)","description":"Fluidsynth samples"},"sitar":{"name":"105 Sitar (ethnic)","description":"Fluidsynth samples"},"banjo":{"name":"106 Banjo (ethnic)","description":"Fluidsynth samples"},"shamisen":{"name":"107 Shamisen (ethnic)","description":"Fluidsynth samples"},"koto":{"name":"108 Koto (ethnic)","description":"Fluidsynth samples"},"kalimba":{"name":"109 Kalimba (ethnic)","description":"Fluidsynth samples"},"bagpipe":{"name":"110 Bagpipe (ethnic)","description":"Fluidsynth samples"},"fiddle":{"name":"111 Fiddle (ethnic)","description":"Fluidsynth samples"},"shanai":{"name":"112 Shanai (ethnic)","description":"Fluidsynth samples"},"tinkle_bell":{"name":"113 Tinkle Bell (percussive)","description":"Fluidsynth samples"},"agogo":{"name":"114 Agogo (percussive)","description":"Fluidsynth samples"},"steel_drums":{"name":"115 Steel Drums (percussive)","description":"Fluidsynth samples"},"woodblock":{"name":"116 Woodblock (percussive)","description":"Fluidsynth samples"},"taiko_drum":{"name":"117 Taiko Drum (percussive)","description":"Fluidsynth samples"},"melodic_tom":{"name":"118 Melodic Tom (percussive)","description":"Fluidsynth samples"},"synth_drum":{"name":"119 Synth Drum (percussive)","description":"Fluidsynth samples"},"reverse_cymbal":{"name":"120 Reverse Cymbal (soundeffects)","description":"Fluidsynth samples"},"guitar_fret_noise":{"name":"121 Guitar Fret Noise (soundeffects)","description":"Fluidsynth samples"},"breath_noise":{"name":"122 Breath Noise (soundeffects)","description":"Fluidsynth samples"},"seashore":{"name":"123 Seashore (soundeffects)","description":"Fluidsynth samples"},"bird_tweet":{"name":"124 Bird Tweet (soundeffects)","description":"Fluidsynth samples"},"telephone_ring":{"name":"125 Telephone Ring (soundeffects)","description":"Fluidsynth samples"},"helicopter":{"name":"126 Helicopter (soundeffects)","description":"Fluidsynth samples"},"applause":{"name":"127 Applause (soundeffects)","description":"Fluidsynth samples"},"gunshot":{"name":"128 Gunshot (soundeffects)","description":"Fluidsynth samples"}}
let gmMap = new Map()
Object.keys(gmInstruments).forEach(key => {
  gmMap.set(key, gmInstruments[key])
})
export const getGMInstruments = function(){
  return gmMap
}

