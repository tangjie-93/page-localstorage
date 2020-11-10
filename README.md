# page-localstorage
&#8195;&#8195;主要用于存储主页面的数据给详情页面使用，并在详情页面返回主页面时进行数据回显。
这个工具包里主要有以下方法：
### 1、构造函数
&#8195;&#8195;在这里主要就是初始化实例，使用`bind`函数将`this`传递到需要使用实例的函数中。表面`this`隐式丢失。
```js
init(pageName){
    // 用于保存页面名称
    this.pageName = pageName;
    // 保存页面设置缓存的key
    this.storageKeys = [];
    //利用bind来使在调用一些实例方法时，使this实例
    this.setStorage = this.setStorage.bind(this);
    // this._setItem = this._setItem.bind(this);
    this.removeStorage = this.removeStorage.bind(this);
    this.getStorage = this.getStorage.bind(this);
}

```
### 2、获取实例
&#8195;&#8195;这里使用了单例模式，来减少性能开销。
```js
function createInstance(pageName) {
    if (!window.localStorage) {
        throw new Error("当前浏览器不支持localStorage");
    }
    // this.instanceObj[pageName] 用于保存实例对象
    if (this.instanceObj[pageName]) {
        return this.instanceObj[pageName];
    }
    return this.instanceObj[pageName] = new LocalStorageClass(pageName);
```
### 3、设置缓存
&#8195;&#8195;在这里会考虑是以`setStorage({key:value})`形式传递过来，还是以`setStorage(key:value)`的形式传递过来。
&#8195;&#8195;同时还对整个页面的`key`的数组进行一个缓存。键`key`为传递进来的`pageName:page`,值`value`为该页面需要缓存的数据的`key`组成的数组(这里的`key`后天添加一个`:page`是为了避免`key`值重复)。
&#8195;&#8195;这里在处理`value`为数组的情况时，会将`value`转换为字符串，并在字符串最后添加`:object`以示区分。
```js
setStorage function(...args){
    ...
     //为页面设置keys数组 
    this.pageName && localStorage.setItem(`${this.pageName}:${PAGE}`, this.storageKeys.join(","));
}
```
### 4、获取缓存
&#8195;&#8195;获取缓存时,会区分传递一个`key`和多个`key`的情况。一个`key`时，直接返回`key`对应的值；传递多个`key`时，返回一个对象。
```js
getStorage function(...args){
    ...
    this._resolveObjectValue();
}
function _resolveObjectValue (key) {
        this._resolveKey(key);
        let value = localStorage.getItem(key);
        const len = OBJECT.length + 1;
        if (typeof value === "string" && value.slice(-len) === `:${OBJECT}`) {
            value = JSON.parse(value.slice(0, -len));
        }
        return value;
    },
```
### 5、删除缓存
&#8195;&#8195;在删除缓存时，考虑三种情况。
+ `pageName`不存在的情况，只删除`filterkeys`中对应`key`的缓存
```js
 // pageName不存在的情况，只删除filterkeys中对应key的缓存
if (!this.pageName) {
    this._removeItem(filterkeys);
    return;
}
```
+ 没有传递参数的情况 这是删除`pageName`对应页面所有`key`对应的缓存值
```js
if (!args || args.length === 0) {
    //避免因为页面刷新，导致storageKeys为空，到时缓存清除不了的问题
    let storageKeys = this.storageKeys;
    let pageKeysStr = localStorage.getItem(`${this.pageName}:${PAGE}`);
    if (storageKeys.length === 0 && pageKeysStr) {
        storageKeys = pageKeysStr.split(",");
    }
    const keys = storageKeys.filter(key => !filterkeys.includes(key));
    this._removeItem(keys);
}
```
+ 删除传入参数中不包含在`filterkeys`中`key`的对应值
```js
const keys = args.filter(key => !filterkeys.includes(key));
this._removeItem(keys);
```
+  删除页面对应的所有`key`
```js
localStorage.removeItem(`${this.pageName}:${PAGE}`);
```