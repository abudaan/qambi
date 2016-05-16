import fetch from 'isomorphic-fetch'

let promises = []

for(let i = 0; i < 4; i++){
  //promises.push(fetchPromise(`http://localhost/test-images/${i}.jpg`))
  promises.push(fetch(`http://localhost/test-images/${i}.jpg`))
}


Promise.all(promises).then(
  (data) => {
    data.forEach((d, i) => {
      if(d.url){
        console.log(i, 'data', d.ok)
      }else{
        console.log(i, 'data', d)
      }
    })
  },
  (err) => {
    console.log('error', err)
  }
)

/*
fetch(url,{
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then((res) => {
  return res.json()
})
.then((data) => {
  console.log(JSON.stringify(data))
})
*/

