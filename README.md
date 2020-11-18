# page-localstorage
&#8195;&#8195;主要用于存储主页面的数据给详情页面使用，并在详情页面返回主页面时进行数据回显。
这个工具包里主要有以下方法：
### 1、构造函数
&#8195;&#8195;这里的构造函数准确来说是一个工厂函数。以该函数原型对象上的`init`函数来作为构造函数，**并将`init`函数的原型指向构造函数的原型**。这样我们实例化`init`函数时，获取到的实例也能获取到该构造函数上的原型属性。
&#8195;&#8195;在在`init`函数中初始化实例，**使用`bind`函数将`this`传递到需要使用实例的函数中。表面`this`隐式丢失。**
```js
function LocalStorageClass (pageName) {
    return  new LocalStorageClass.prototype.init(pageName);
}
```
```js
init(pageName){
    // 用于保存页面名称
    this.pageName = pageName;
    // 保存页面设置缓存的key
    this.storageKeys = [];
    //利用bind来使在调用一些实例方法时，使this指向实例
    this.setStorage = this.setStorage.bind(this);
    this.removeStorage = this.removeStorage.bind(this);
    this.getStorage = this.getStorage.bind(this);
    this.removeStorageByPageName=this.removeStorageByPageName.bind(this);
    this.removeAllPageStorage=this.removeAllPageStorage.bind(this);
}
```
### 2、静态属性
&#8195;&#8195;构造函数对象上有3个静态属性:分别是`instanceObj`、`pageNames`和`createInstance`，
```js
// 用于存储单例对象
LocalStorageClass.instanceObj = Object.create(null);
//主要用于在刷新页面后数据(pageName)丢失的问题
LocalStorageClass.pageNames=[];
// 单例
LocalStorageClass.createInstance
```
### 3、获取实例
&#8195;&#8195;这里使用了单例模式，来减少性能开销。并且使用一个静态对象来存储实例对象。键为页面名称，值为实例对象。
```js
function createInstance(pageName) {
    if(typeof window!=='object'){
        throw new Error("当前库只适用于浏览器环境");
    }
    if (!window.localStorage) {
        throw new Error("当前浏览器不支持localStorage");
    }
    // this.instanceObj[pageName] 用于保存实例对象
    if (this.instanceObj[pageName]) {
        return this.instanceObj[pageName];
    }
    return this.instanceObj[pageName] = new LocalStorageClass(pageName);
```
### 4、设置缓存
&#8195;&#8195;在这里会考虑是以 **`setStorage({key:value})`** 形式传递过来，还是以 **`setStorage(key:value)`** 的形式传递过来。
&#8195;&#8195;**同时还对整个页面的`key`的数组进行一个缓存。** 键`key`为传递进来的`pageName:page`,值`value`为该页面需要缓存的数据的`key`组成的数组(这里的`key`后天添加一个`:page`是为了避免`key`值重复)。这样设置的原因是**避免页面刷新获取不到页面keys的问题**。
&#8195;&#8195;这里在**处理`value`为对象的情况时，会将`value`转换为字符串，并在字符串最后添加`:object`以示区分**。
```js
setStorage function(...args){
    ...
     //为页面设置keys数组 
    this.pageName && localStorage.setItem(`${this.pageName}:${PAGE}`, this.storageKeys);
}
```
### 5、获取缓存
&#8195;&#8195;获取缓存时,会区分传递一个`key`和多个`key`的情况。一个`key`时，直接返回`key`对应的值；传递多个`key`时，返回一个对象。
&#8195;&#8195;**在获取的值的字符串后面以`:object`结尾时，会默认将值转换为对象，很好的避免了后面拿到值再去判断是否是对象的不足。**
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
### 6、删除缓存
&#8195;&#8195;在这里提供了三个方法来删除缓存。
#### 方法 1 removeStorage (filterkeys = [], needRmKeys=[])
&#8195;&#8195;在这个方法中删除缓存时，考虑三种情况。
+ 页面名称`pageName`不存在的情况，不做任何处理
```js
if (!this.pageName) {
    return;
}
```
+ 没有传递需要删除的`keys`的情况 这是删除`pageName`对应页面所有`key`对应的缓存值
```js
if (filterkeys.length === 0 && needRmKeys.length === 0) {
    this.removeStorageByPageName();
    return;
}
```
+ 没有传递需要删除的`keys`,但是传递了不想删除的`keys`的情况
```js
const pageKeys = this._getKeysByPageName();
//没有传递参数的情况 这是删除pageName对应页面所有key对应的缓存值
if (needRmKeys.length === 0) {
    //避免因为页面刷新，导致storageKeys为空，到时缓存清除不了的问题
    let storageKeys = this.storageKeys;

    if (storageKeys.length === 0 && pageKeys.length > 0) {
        storageKeys = pageKeys;
    }
    const keys = storageKeys.filter(key => !filterkeys.includes(key));
    this._removeItem(keys, pageKeys);
}
```
+ 删除传入参数中不包含在`filterkeys`中`key`的对应值
```js
const pageKeys = this._getKeysByPageName();
const keys = needRmKeys.filter(key => !filterkeys.includes(key));
this._removeItem(keys,pageKeys);
```
#### 方法 2 removeStorageByPageName (pageName) 
&#8195;&#8195;根据页面名称删除当前页面对应的缓存。
```js
 removeStorageByPageName (pageName = this.pageName) {
    let pageKeysStr = localStorage.getItem(`${pageName}:${PAGE}`);
    if (pageKeysStr) {
        const storageKeys = pageKeysStr.split(",");
        this._removeItem(storageKeys);
        //删除页面对应的所有key
        localStorage.removeItem(`${pageName}:${PAGE}`);
    }
    //从静态页面数组中删除指定页面，同时从缓存中也删除指定页面
    const pageNames = LocalStorageClass.pageNames
    const index = pageNames.indexOf(pageName);
    if (index > -1) {
        pageNames.splice(index, 1);
        localStorage.setItem(`${PAGENAMES}:${PAGENAMES}`, pageNames);
    }
}
```
#### 方法 3 removeAllPageStorage()
&#8195;&#8195;删除所有页面保存在客户端的缓存。
```js
 //避免页面刷新获取不到页面keys的问题
let pageNames = localStorage.getItem(`${PAGENAMES}:${PAGENAMES}`)
if (pageNames) {
    pageNames = pageNames.split(",");
    each(pageNames, (_, pageName) => {
        this.removeStorageByPageName(pageName);
    })
    localStorage.removeItem(`${PAGENAMES}:${PAGENAMES}`)
}
```
**注意：在页面卸载时需要注意删除所有页面对应的缓存，避免占用不必要的客户端内存。**
```js
//处理方法1 全局混入
Vue.mixin({
     beforecreate(){
        window.addEventListener("unload",()=>{
            //在这里删除所有的页面相关的客户端缓存
        })
    }
})
```