let o = {
  midievents: {
    m1: [0, 144, 60, 100],
    m2: [0, 128, 60, 100],
  },
  songs: {
    s1: {
      midievents: []
    }
  }
}


o.songs.s1.midievents = [o.midievents.m1, o.midievents.m2]
//console.log(o.songs.s1)
let o1 = {...o}
//let o1 = {}
//Object.assign(o1, o)
o1.midievents.m2 = [120, 128, 60, 0]
console.log(o1.midievents)
console.log('-----')
console.log(o1.songs.s1)
