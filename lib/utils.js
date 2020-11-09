export function toType(obj){
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
export function isString(key){
    return toType(key)==='string';
}