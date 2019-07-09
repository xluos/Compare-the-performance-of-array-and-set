const MB_SIZE = 1024 * 1024
function formatMemory (size) {
  return size < MB_SIZE ? 
  `${(size/1024).toFixed(3)}KB` 
  : `${(size/MB_SIZE).toFixed(3)}MB`
}
function getMemory() {
  let memory = process.memoryUsage()
  console.log('------------------------------------')
  console.log('总占用:', formatMemory(memory.rss))
  console.log('堆内存:', formatMemory(memory.heapTotal))
  console.log('堆内存（使用中）:', formatMemory(memory.heapUsed))
  console.log('V8占用:', formatMemory(memory.external))
  console.log('------------------------------------')
}

module.exports = getMemory