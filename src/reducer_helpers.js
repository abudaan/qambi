
export function addTracks(state, action){
  state = {...state}
  let entities = state.entities
  let {songId, trackIds} = action.payload
  let song = entities[songId]
  if(song){
    trackIds.forEach(function(trackId){
      let track = entities[trackId]
      if(track){
        song.trackIds.push(trackId)
        if(track.songId !== songId){
          track.songId = songId
          track.partIds.forEach(function(partId){
            song.partIds.push(partId)
          })
          track.midiEventIds.forEach(function(eventId){
            let event = entities[eventId]
            event.songId = songId
          })
          song.newEventIds.push(...track.midiEventIds)
        }
      }else{
        console.warn(`no track with id ${trackId}`)
      }
    })
  }else{
    console.warn(`no song found with id ${songId}`)
  }
  return state
}


export function addParts(state, action){
  state = {...state}
  let entities = state.entities
  let {trackId, partIds} = action.payload
  let track = entities[trackId]
  let songId = track.songId
  let song
  let part
  if(songId){
    song = entities[songId]
  }
  if(track){
    partIds.forEach(function(partId){
      part = entities[partId]
      if(part){
        track.partIds.push(partId)
        if(part.trackId !== trackId){
          part.trackId = trackId
          part.midiEventIds.forEach(function(eventId){
            let event = entities[eventId]
            event.trackId = trackId
            track.midiEventIds.push(eventId)
            if(song){
              event.songId = songId
              song.newEventIds.push(eventId)
            }
          })
        }
      }else{
        console.warn(`no part found with id ${partId}`)
      }
    })
  }else{
    console.warn(`no track found with id ${trackId}`)
  }
  return state
}


export function addMIDIEvents(state, action){
  state = {...state};
  let entities = state.entities
  let {partId, midiEventIds} = action.payload
  let part = state.entities[partId]
  let trackId = part.trackId
  let songId, track, song
  if(trackId){
    track = entities[trackId]
    songId = track.songId
    if(songId){
      song = entities[songId]
    }
  }
  if(part){
    midiEventIds.forEach(function(eventId){
      let midiEvent = state.entities[eventId]
      if(midiEvent){
        part.midiEventIds.push(eventId)
        midiEvent.partId = partId
        if(track){
          track.midiEventIds.push(eventId)
          midiEvent.trackId = part.trackId
          if(song){
            midiEvent.songId = track.songId
            song.newEventIds.push(eventId)
          }
        }
      }else{
        console.warn(`no MIDI event found with id ${eventId}`)
      }
    })
  }else{
    console.warn(`no part found with id ${partId}`)
  }
  return state
}
