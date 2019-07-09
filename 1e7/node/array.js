const getMemory = require('./memory.js')
const data = require('./data.json')

const COUNT = 1e7
console.time('new_arr')
let arr = []
console.timeEnd('new_arr')

getMemory()

// 创建时间
console.time('push_arr')
for(let i = 0; i < COUNT; i++) {
  arr.push(i)
}
console.timeEnd('push_arr')

// 赋值时间
console.time('push_arr2')
for(let i = 0; i < COUNT; i++) {
  arr[i] = i + 1
}
console.timeEnd('push_arr2')

// 赋值时间
console.time('push_arr3')
for(let i = 0; i < COUNT; i++) {
  arr[i] = i - 1
}
console.timeEnd('push_arr3')

//  单循环时间
console.time('for_time')
for(let i = 0; i < COUNT; i++) {
  // arr[i] = i
}
console.timeEnd('for_time')

getMemory()

// console.time('indexOf_time')
// for(let i = data.length; i >=0 ; i--) {
//   arr.indexOf(data[i])
// }
// console.timeEnd('indexOf_time')


// console.time('includes_time')
// for(let i = data.length; i >=0 ; i--) {
//   arr.includes(data[i])
// }
// console.timeEnd('includes_time')

function deleteFromArr (arr, item) {
  let index = arr.indexOf(item);
  return index !== -1 && arr.splice(index, 1);
}

console.time('deleteFromArr_time')
for(let i = data.length; i >=0 ; i--) {
  deleteFromArr(arr, data[i])
}
console.timeEnd('deleteFromArr_time')


