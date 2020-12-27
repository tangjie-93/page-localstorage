; (function () {
    const { toType, isString, each } = require("./utils")
    const PAGE = "page", OBJECT = "object", PAGENAMES = "pageNames";
    function LocalStorageClass (pageName) {
        return new LocalStorageClass.prototype.init(pageName);
    }
    // 用于存储单例的对象
    LocalStorageClass.instanceObj = Object.create(null);
    //主要用于在刷新页面后数据(pageName)丢失的问题
    LocalStorageClass.pageNames = [];
    // 单例
    LocalStorageClass.createInstance = function (pageName) {
        if (typeof window !== 'object') {
            throw new Error("当前库只适用于浏览器环境");
        }
        if (!window.localStorage) {
            throw new Error("当前浏览器不支持localStorage");
        }
        if (this.instanceObj[pageName]) {
            return this.instanceObj[pageName];
        }
        !this.pageNames.includes(pageName) && this.pageNames.push(pageName);
        return this.instanceObj[pageName] = LocalStorageClass(pageName);
    }
    LocalStorageClass.prototype = {
        constructor: LocalStorageClass,
        init :function(pageName) {
            // pageName必须是字符串
            this._resolveKey(pageName);
            this.pageName = pageName;
            this.storageKeys = [];
            this.setStorage = this.setStorage.bind(this);
            this.removeStorage = this.removeStorage.bind(this);
            this.getStorage = this.getStorage.bind(this);
            this.removeStorageByPageName = this.removeStorageByPageName.bind(this);
            this.removeAllPageStorage = this.removeAllPageStorage.bind(this);
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
            const pageName=this.pageName
            //为页面设置keys数组
            if (pageName) {
                this._setItem(`${pageName}:${PAGE}`, this.storageKeys);
                
                //避免页面刷新获取不到页面keys的问题
                const pageNames = LocalStorageClass.pageNames
                const index = pageNames.indexOf(pageName);
                index<0&&pageNames.push(pageName)
                localStorage.setItem(`${PAGENAMES}:${PAGENAMES}`, pageNames);
            }
        },
        /**
         * 按需删除页面的缓存
         * @param {Array} filterkeys 需要过滤掉的keys
         * @param  {Array} needRmKeys 需要删除的keys
         */
        removeStorage (filterkeys = [], needRmKeys = []) {
            // pageName不存在的情况
            if (!this.pageName) {
                throw new TypeError("请传输需要删除的key");
            }
            if (filterkeys.length === 0 && needRmKeys.length === 0) {
                this.removeStorageByPageName();
                return;
            }
            const pageKeys = this._getKeysByPageName(this.pageName);
            let keys;
            //没有传递参数的情况 这是删除pageName对应页面所有key对应的缓存值
            if (needRmKeys.length === 0) {
                //避免因为页面刷新，导致storageKeys为空，到时缓存清除不了的问题
                let storageKeys = this.storageKeys;

                if (storageKeys.length === 0 && pageKeys.length > 0) {
                    storageKeys = pageKeys;
                }
                keys = storageKeys.filter(key => !filterkeys.includes(key));
                this._removeItem(keys, pageKeys);
            } else {
                // 否则删除传入参数中不包含在filterkeys中key的对应值
                keys = needRmKeys.filter(key => !filterkeys.includes(key));

            };
            this._removeItem(keys, pageKeys);
        },
        //根据页面删除缓存
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
                pageNames.length ? 
                localStorage.setItem(`${PAGENAMES}:${PAGENAMES}`, pageNames) :
                localStorage.removeItem(`${PAGENAMES}:${PAGENAMES}`)
            }
        },
        //删除所有页面的缓存
        removeAllPageStorage () {
            //避免页面刷新获取不到页面keys的问题
            let pageNames = localStorage.getItem(`${PAGENAMES}:${PAGENAMES}`)
            if (pageNames) {
                pageNames = pageNames.split(",");
                each(pageNames, (_, pageName) => {
                    this.removeStorageByPageName(pageName);
                })
            }
             localStorage.removeItem(`${PAGENAMES}:${PAGENAMES}`)
        },

        //根据 key 来获取缓存
        getStorage (...args) {
            const len = args.length;
            //当没有传递参数的时候，同时pageName存在的情况
            if (len === 0 && this.pageName) {
                let pageKeysStr = localStorage.getItem(`${this.pageName}:${PAGE}`);
                if (pageKeysStr) {
                    const storageKeys = pageKeysStr.split(",");
                    return storageKeys.reduce((obj, key) => {
                        obj[key] = this._resolveObjectValue(key);
                        return obj;
                    }, {})
                }
            }
            if (args.length === 1) {
                return this._resolveObjectValue(args[0]);
            }
            return args.reduce((obj, key) => {
                obj[key] = this._resolveObjectValue(key);
                return obj;
            }, {})
        },
        _resolveKey (key) {
            if (key && !isString(key)) {
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
         * @param {Array} pageKeys 页面对应的keys
         */
        _removeItem (arr, pageKeys) {
            each(arr, (_, key) => {
                pageKeys && pageKeys.splice(pageKeys.indexOf(key), 1);
                this._resolveKey(key);
                localStorage.removeItem(key);
            });
            //判断
            if (pageKeys) {
                const pageName = this.pageName;
                pageKeys.length ? localStorage.setItem(`${pageName}:${PAGE}`, pageKeys) : localStorage.removeItem(`${pageName}:${PAGE}`)
            }
        },
        /**
         * 根据页面来获取该页面的keys
         * @param {String} pageName 
         * @returns { Array} 当前页面的keys
         */
        _getKeysByPageName (pageName) {
            let pageKeysStr = localStorage.getItem(`${pageName}:${PAGE}`);
            if (pageKeysStr) {
                return pageKeysStr.split(",");
            }
            return [];
        }
    }
    LocalStorageClass.prototype.init.prototype = LocalStorageClass.prototype;
    if (typeof module === "object" && typeof module.exports === 'object') {
        module.exports = {
            getLocalStorageInstance: pageName => LocalStorageClass.createInstance(pageName)
        }
    }
})()
