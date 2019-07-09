const fs = require('fs')
function random () {
  return ~~(Math.random() * 1e3)
}

let arr = []
for(let i = 0; i < 1e2; i++) {
  arr.push(random())
}

fs.writeFileSync('./data.json', JSON.stringify(arr))
fs.writeFileSync('./data.js', `var data = ${JSON.stringify(arr)}`)