原文参见[掘金文章](https://juejin.im/post/5d2446e0f265da1b88120269)

## 前言
为什么要做这个对比呢？因为昨天看到了这篇文章[《如何使用 Set 来提高代码的性能》](https://juejin.im/post/5d2284dc51882579df4a4cee)，文章中说到的好多东西我并不认同，原则这一味的推崇Set比数组要快，这是挑战我认知的在我认知中线性存储的数组似乎没有别的数据结构在存取方面能比数组更快看，特别是下面的一些测试只用一组数据对比，这让我感觉原作者根本就没有认真对比。所以萌生了自己测试一把的想法。

本来题目打算取成《驳：<如何使用 Set 来提高代码的性能>》的😂，测试完发现并没有什么好驳的，就不给前端娱乐圈添加新闻了。

废话不多说，下面放上测试数据

**为了能够清楚的看到内存的消耗，测试在浏览器和Node中分别跑一次，以Node中的内存消耗为参考。数据量为1e7降低**

```javascript
const MB_SIZE = 1024 * 1024;

function formatMemory (size) {
  return size < MB_SIZE ? `${(size/1024).toFixed(3)}KB` : `${(size/MB_SIZE).toFixed(3)}MB`
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
```

## 创建&添加元素对比

#### Array
```javascript
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
```
测试结果为：

```js
new_arr: 0.156ms
------------------------------------
总占用: 20.820MB
堆内存: 9.234MB
堆内存（使用中）: 4.060MB
V8占用: 85.453KB
------------------------------------
push_arr: 221.450ms
push_arr2: 10.103ms
push_arr3: 9.332ms
for_time: 6.687ms
------------------------------------
总占用: 362.148MB
堆内存: 350.246MB
堆内存（使用中）: 344.085MB
V8占用: 8.477KB
------------------------------------
```
可以看到由于js中的`Array`是动态创建的所以第一次push创建数组的时候相对与后面的直接存取时间相差了**20倍**左右，并且直接存取的大部分时间还是循环所耗费的。可见动态创建申请内存非常的耗费时间，内存申请到后的存取就非常符合O(1)的时间了，下面看一下`Set`的表现。

#### Set

```js
const COUNT = 1e7

console.time('new Set')
let set = new Set()
console.timeEnd('new Set')

getMemory()

console.time('set_add')
for(let i = 0; i < COUNT; i++) {
  set.add(i)
}
console.timeEnd('set_add')

getMemory()
```

测试结果为：

```js
new Set: 0.169ms
------------------------------------
总占用: 20.828MB
堆内存: 9.234MB
堆内存（使用中）: 4.057MB
V8占用: 85.453KB
------------------------------------
set_add: 2282.407ms
------------------------------------
总占用: 662.043MB
堆内存: 650.227MB
堆内存（使用中）: 644.690MB
V8占用: 85.453KB
------------------------------------
```
可以看到同样的数量`Set`创建速度比`Array`要慢了近**10倍**，内存占用也多出了近**2倍**。我们都知道`Set`底层有`红黑树`和`HashSet`两种实现方式，都是以空间换时间。虽然没有看过`V8`的具体实现，但是由于JS中`Set`是无序的，结合后面测试`set.has()`是O(1)的时间复杂度，可以猜测`V8`中的`Set`是以`Hash`的形式实现的，有`Hash`必然涉及到动态扩张`Hash`或者链式`Hash`，空间自然会占用的多。

## 查找元素

首先我们通过下面这段代码随机生成10000个元素来进行查找的测试
```js
const fs = require('fs')
function random () {
  return ~~(Math.random() * 1e7)
}

let arr = []
for(let i = 0; i < 1e3; i++) {
  arr.push(random())
}

fs.writeFileSync('./data.json', JSON.stringify(arr))
```

#### Array
```js
console.time('indexOf_time')
for(let i = data.length; i >=0 ; i--) {
  arr.indexOf(data[i])
}
console.timeEnd('indexOf_time')


console.time('includes_time')
for(let i = data.length; i >=0 ; i--) {
  arr.includes(data[i])
}
console.timeEnd('includes_time')
```
测试结果：

```js 
indexOf_time: 52451.386ms
includes_time: 52599.605ms
```


#### Set

```js
console.time('set_has_time')
for(let i = data.length; i >=0 ; i--) {
  set.has(data[i])
}
console.timeEnd('set_has_time')
```

测试结果为：
```js
set_has_time: 3.402ms
```

可以看到对比非常夸张数组查询的速度基本比`Set`慢了**15000倍！**，远超**原文的7.54倍**。这是为什么呢？经过前面的分析我们知道`Set`底层又`Hash`实现，查询的复杂度基本为O(1)，查询时间并不会随着数据的增大而增大，而数组的查询为线性的O(n)，由于我们本次测试的数据量又达到了1e7的数量，所以查询的速度就相差了非常多了。

## 删除元素

删除必然依赖查询，从查询的结果上来看我们已经可以预见删除测试的结果了，由于`Array`作为一个线性的数据结构是不存在删除操作的，一般来说都是将某个位置置空来表示删除的，如果非要使用`splice(index, 1)`来进行删除，那么相当与将`index`后面所有的元素都移动了一次，相当于又是一次O(n)的操作，可以遇见性能一定好不了。为了节省时间这次我们将删除的数据调整为**1000个**

创建删除辅助函数：
```js
function deleteFromArr (arr, item) {
  let index = arr.indexOf(item);
  return index !== -1 && arr.splice(index, 1);
}
```

#### Array
```js
function deleteFromArr (arr, item) {
  let index = arr.indexOf(item);
  return index !== -1 && arr.splice(index, 1);
}

console.time('includes_time')
for(let i = data.length; i >=0 ; i--) {
  deleteFromArr(arr, data[i])
}
console.timeEnd('includes_time')
```
测试结果为:
```js
deleteFromArr_time: 8245.150ms
```

#### Set

```js
console.time('set_delete_time')
for(let i = data.length; i >=0 ; i--) {
  set.delete(data[i])
}
console.timeEnd('set_delete_time')
```
测试结果为:
```js
set_delete_time: 0.574ms
```
显然结果与我们预测的一样，同样`Set`的性能远超`Array`


## 结论

||内存(MB)|创建时间(MS)|查询(MS)|删除(MS)|
|-|-|-|-|-|
|Array|	344|	221|	5245|	8245|
|Set|	644|	2282|	0.34|	0.574|

![](https://user-gold-cdn.xitu.io/2019/7/9/16bd61cfab4a07d2?w=775&h=495&f=png&s=19042)
上面的对比数据如下图（为了方便显示将查询与删除的数量压缩到同一数量级），可以看到，出了内存和创建时间`Array`占优势之外其他两种情况都是`Set`**远超**`Array`，但是别忘了我们上面的数据量是多少？**1e7！** 这是一个平时代码中几乎接触不到的数据量，哪怕是在Node里我也想象不到什么场景下需要我们手动在内存里操作一个1e7数量级的`Array`，更别说浏览器的环境下了。一般在客户端下我们的操作的数据不会超过`1e3`，单个页面上千的数据映射到DOM上已经非常卡了，更别说更高的数量级了。下面我们看一下`1e3`级别的性能对比，可以看到全部都是`1MS`都不到的数据，小数据下使用时根本不用考虑两者性能的开支，你多操作一次DOM造成的性能开始都比你操作数据的开支要多的多了。所以日常开发中**在适合的场景使用适合的工具，有时你考虑的性能在整个环节中根本就是微不足道的**
||内存(MB)|创建时间(MS)|查询(MS)|删除(MS)|
|-|-|-|-|-|
|Array|	4|	0.61|	0.14|	0.135|
|Set|	4|	0.81|	0.102|	0.08|
![](https://user-gold-cdn.xitu.io/2019/7/9/16bd6697787f1d8e?w=775&h=506&f=png&s=18871)

以上，并不是说性能不重要，而是要在合适的场景去考虑合适的性能优化，在客户端考虑一下如何减少重排重绘要比考虑使用Array还是Set能减少更多的开销，在服务端合理的设计可能会比考虑这个带来更大的优化。

最后，测试的所有代码都在这里[https://github.com/xluos/Compare-the-performance-of-array-and-set](https://github.com/xluos/Compare-the-performance-of-array-and-set)