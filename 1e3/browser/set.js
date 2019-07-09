
console.time('new Set')
let set = new Set()
console.timeEnd('new Set')


console.time('set_add')
for(let i = 0; i < COUNT; i++) {
  set.add(i)
}
console.timeEnd('set_add')


console.time('set_has_time')
for(let i = data.length; i >=0 ; i--) {
  set.has(data[i])
}
console.timeEnd('set_has_time')

console.time('set_delete_time')
for(let i = data.length; i >=0 ; i--) {
  set.delete(data[i])
}
console.timeEnd('set_delete_time')


