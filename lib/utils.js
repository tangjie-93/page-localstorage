/**
 * 判断数据类型
 * @param {any} obj 
 * @returns {String}
 */
function toType (obj) {
    const dataTypes = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object", "Error", "Symbol"]
    const class2type = dataTypes.reduce((obj, name) => {
        obj["[object " + name + "]"] = name.toLowerCase();
        return obj;
    }, {});
    const { toString } = Object.prototype;
    //obj为null或者undefined
    if (obj == null) {
        return obj + "";
    }
    const type = typeof obj
    // Support: Android <=2.3 only (functionish RegExp)
    return /^(object|function)$/.test(type) ?
        class2type[toString.call(obj)] || "object" : type
}
/**
 * 判断是否是字符串类型
 * @param {String} key 
 */
function isString (key) {
    return toType(key) === 'string';
}
/**
 * 判断是否是函数
 * @param {Function} obj 
 */
function isFunction (obj) {
    //typeof obj.nodeType !== "number"; 兼容ie浏览器
    return typeof obj === "function" && typeof obj.nodeType !== "number";
};
/**
 * 判断是否是window
 * @param {Object} obj 
 */
function isWindow (obj) {
    //window等于window.window
    return obj != null && obj === obj.window;
};
/**
 * 判断是否是类数组
 * @param {*} obj 
 */
function isArrayLike (obj) {
    //1、获取length的值(false或者length的实际值)
    const length = !!obj && "length" in obj && obj.length;
    const type = toType(obj);
    //2、不能是函数或者window(他们都有length属性)
    if (isFunction(obj) || isWindow(obj)) {
        return false;
    }
    /**
     * type === "array" 表示是数组
     * length===0 表示是一个length为0的类数组
     * typeof length === "number" && length > 0  表示length必须大于0的非空的类数组
     * (length - 1) in obj 表示最大索引也存在(表示其按照索引递增)
     */
    return type === "array" || length === 0 ||
        (typeof length === "number" && length > 0 && (length - 1) in obj);
}
/**
 * 循环遍历函数
 * @param {Object|Array} obj 循环对象或数组
 * @param {Function} callback 回调函数
 */
function each (obj, callback) {
    if (isArrayLike(obj)) {
        for (let i = 0, len = obj.length; i < len; i++) {
            if (callback.call(obj[i], i, obj[i]) === false) {
                //循环终止
                break;
            }
        }
    } else {
        const keys = [
            ...Object.keys(obj), ...Object.getOwnPropertySymbols(obj)
        ];
        for (let i = 0, len = keys.length; i < len; i++) {
            //回调执行返回false这终止循环
            if (callback.call(obj[i], i, obj[key]) === false) {
                //循环终止
                break;
            }
        }
    }
}
module.exports = {
    toType,
    isString,
    each
}