const { toType, isString } = require("./utils")
class LocalStorageClass {
    //实例
    static instance = null;
    static instanceObj = Object.create(null);
    constructor (pageName) {
        this.pageName = pageName;
        this.storageKeys = [];
    }

    static createInstance (pageName) {
        if (!window.localStorage) {
            throw new Error("当前浏览器不支持localStorage");
        }
        if (this.instanceObj[pageName]) {
            return this.instanceObj[pageName];
        }
        this.instance = new LocalStorageClass(pageName);
        this.instanceObj[pageName] = this.instance;
        return this.instance;
    }
    /**
     * 将数据保存到缓存中
     * @param  {...any} args 可以是一个对象也可以是 key value的形式
     */
    setStorage (...args) {
        const len = args.length;
        //key value的形式
        if (len === 2) {
            this.setItem(args[0], args[1]);
        } else if (len === 1 && toType(obj) === 'object') {
            const keys = Object.keys(args[0]), len = keys.length;
            for (let i = 0; i < len; i++) {
                this.setItem(keys[i], args[0][key])
            }
        } else {
            throw new TypeError("您传递的参数格式不正确,格式为(key,value)或者({key:value})")
        }
        //为页面设置keys数组
        this.pageName && localStorage.setItem(`${this.pageName}:page`, this.storageKeys.join(","));
    }
    removeStorage (filterkeys = [], ...args) {
        if (!this.pageName) {
            filterkeys.length && filterkeys.forEach(key => localStorage.removeItem(key));
            return;
        }
        if (!args || args.length === 0) {
            //避免因为页面刷新，导致storageKeys为空，到时缓存清除不了的问题
            let storageKeys = this.storageKeys;
            let pageKeysStr = localStorage.getItem(`${this.pageName}:page`);

            if (storageKeys.length === 0 && pageKeysStr) {
                storageKeys = pageKeysStr.split(",");
            }
            storageKeys.filter(key => !filterkeys.includes(key)).forEach(key => localStorage.removeItem(key));
        } else {
            args.filter(key => !filterkeys.includes(key)).forEach(key => localStorage.removeItem(key));
        };
        localStorage.removeItem(`${this.pageName}:page`);
    }
    getStorage (...args) {
        if (args.length === 1) {
            if (!isString(args[0])) {
                throw new TypeError("key必须是字符串");
            }
            return this.resolveObjectValue(args[0]);
        }
        return args.reduce((obj, key) => {
            obj[kay] = this.resolveObjectValue(key);
            return obj;
        }, {})
    }
    /**
     * 处理value是Object的情况
     * @param {String} key 
     */
    resolveObjectValue (key) {
        let value = localStorage.getItem(key);
        if (typeof value === "string" && value.slice(-7) === ":object") {
            value = JSON.parse(value.slice(0, -15));
        }
        return value;
    }
    /**
     * 缓存数据
     * @param {String} key 
     * @param {String} value 
     */
    setItem (key, value) {
        if (!isString(key)) {
            throw new TypeError("key必须是字符串");
        }
        if (toType(obj) === 'object') {
            value = JSON.stringify(value) + ":object";
        }
        localStorage.setItem(key, value);
        const storageKeys = this.storageKeys;
        !storageKeys.includes(key) && storageKeys.push(args[0]);
    }
}
if (typeof module !== undefined && module.exports) {
    module.exports = {
        getLocalStorageInstance: pageName => new LocalStorageClass(pageName)
    }
}

// export const getLocalStorageInstance = pageName => new LocalStorageClass(pageName);