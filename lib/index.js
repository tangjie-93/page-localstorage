const { toType, isString, each } = require("./utils")
const PAGE = "page", OBJECT = "object"
function LocalStorageClass (pageName) {
    this.init(pageName);
}
// 用于存储单例的对象
LocalStorageClass.instanceObj = Object.create(null);
// 单例
LocalStorageClass.createInstance = function (pageName) {
    if (!window.localStorage) {
        throw new Error("当前浏览器不支持localStorage");
    }
    if (this.instanceObj[pageName]) {
        return this.instanceObj[pageName];
    }
    return this.instanceObj[pageName] = new LocalStorageClass(pageName);
}
LocalStorageClass.prototype = {
    constructor: LocalStorageClass,
    init (pageName) {
        // pageName必须是字符串
        this._resolveKey(pageName);
        this.pageName = pageName;
        this.storageKeys = [];
        this.setStorage = this.setStorage.bind(this);
        // this._setItem = this._setItem.bind(this);
        this.removeStorage = this.removeStorage.bind(this);
        this.getStorage = this.getStorage.bind(this);
    },
    /**
    * 将数据保存到缓存中
    * @param  {...any} args 可以是一个对象{key1:value1,key2:value2,...}也可以是 key value的形式
    */
    setStorage (...args) {
        const len = args.length;
        //key value的形式
        if (len === 2) {
            this._setItem(args[0], args[1]);
        } else if (len === 1 && toType(args[0]) === OBJECT) {
            const keys = Object.keys(args[0]), len = keys.length;
            for (let i = 0; i < len; i++) {
                this._setItem(keys[i], args[0][keys[i]])
            }
        } else {
            throw new TypeError("您传递的参数格式不正确,格式为(key,value)或者({key:value})")
        }
        //为页面设置keys数组
        this.pageName && localStorage.setItem(`${this.pageName}:${PAGE}`, this.storageKeys.join(","));
    },
    /**
     * 删除本地缓存
     * @param {Array} filterkeys 
     * @param  {...any} args keys
     */
    removeStorage (filterkeys = [], ...args) {
        // pageName不存在的情况，只删除filterkeys中对应key的缓存
        if (!this.pageName) {
            this._removeItem(filterkeys);
            return;
        }
        //没有传递参数的情况 这是删除pageName对应页面所有key对应的缓存值
        if (!args || args.length === 0) {
            //避免因为页面刷新，导致storageKeys为空，到时缓存清除不了的问题
            let storageKeys = this.storageKeys;
            let pageKeysStr = localStorage.getItem(`${this.pageName}:${PAGE}`);
            if (storageKeys.length === 0 && pageKeysStr) {
                storageKeys = pageKeysStr.split(",");
            }
            const keys = storageKeys.filter(key => !filterkeys.includes(key));
            this._removeItem(keys);
        } else {
            // 否则删除传入参数中不包含在filterkeys中key的对应值
            const keys = args.filter(key => !filterkeys.includes(key));
            this._removeItem(keys);
        };
        //删除页面对应的所有key
        localStorage.removeItem(`${this.pageName}:${PAGE}`);
    },
    getStorage (...args) {
        if (args.length === 1) {
            return this._resolveObjectValue(args[0]);
        }
        return args.reduce((obj, key) => {
            obj[key] = this._resolveObjectValue(key);
            return obj;
        }, {})
    },
    _resolveKey (key) {
        if (!isString(key)) {
            throw new TypeError(`key必须是字符串,${key}不符合条件`);
        }
    },
    /**
     * 处理value是Object的情况
     * @param {String} key 
     */
    _resolveObjectValue (key) {
        this._resolveKey(key);
        let value = localStorage.getItem(key);
        const len = OBJECT.length + 1;
        if (typeof value === "string" && value.slice(-len) === `:${OBJECT}`) {
            value = JSON.parse(value.slice(0, -len));
        }
        return value;
    },
    /**
     * 缓存数据
     * @param {String} key 
     * @param {String} value 
     */
    _setItem (key, value) {
        //通过对象的形式传递的key在对象中会默认调用toString方法
        if (!isString(key) || key === "[object Object]") {
            throw new TypeError("key必须是字符串");
        }
        if (toType(value) === OBJECT) {
            value = JSON.stringify(value) + `:${OBJECT}`;
        }
        localStorage.setItem(key, value);
        const storageKeys = this.storageKeys;
        !storageKeys.includes(key) && storageKeys.push(key);
    },
    /**
     * 清除缓存
     * @param {Array} arr 
     */
    _removeItem (arr) {
        each(arr, key => {
            this._resolveKey(key);
            localStorage.removeItem(key);
        })
    }
}

if (typeof module !== undefined && module.exports) {
    module.exports = {
        getLocalStorageInstance: pageName => LocalStorageClass.createInstance(pageName)
    }
}