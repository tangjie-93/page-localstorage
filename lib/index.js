class LocalStorageClass{
    static instance=null;
    static instanceObj=Object.create(null);
    constructor(pageName){
        this.pageName=pageName;
        this.storageKeys=[];

    }
    static createInstance(pageName){
        if(!window.localStorage){
            throw new Error("当前浏览器不支持localStorage");
        }
        if(this.instanceObj[pageName]){
            return this.instanceObj[pageName];
        }
        this.instance=new LocalStorageClass(pageName);
        this.instanceObj[pageName]=this.instance;
        return this.instance;
    }
    /**
     * 将数据保存到缓存中
     * @param  {...any} args 可以是一个对象也可以是 key value的形式
     */
    setStorage(...args){
        const toString=Object.prototype.toString;
        const storageKeys=this.storageKeys;
        const len=args.length;
        //key value的形式
        if(len===2){
            localStorage.setItem(args[0],args[1]);
            !localStorage.includes(args[0])&&localStorage.push(args[0]);
        }else if(len===1&&toString.call(args[0]==="[object Object]")){
            const keys=Object.keys(args[0]),len=keys.length;
            let key,i=0;
            for(;i<len;i++){
                key=keys[i];
                if(toString.call(key)==="[object Object]"){
                    throw new TypeError("key必须是字符串");
                }
                if(toString.call(args[0][key])==="[object Object]"){
                    args[0][key]=JSON.stringify(args[0][key])+"[object Object]";
                }
                localStorage.setItem(key,args[0][key]);
                !storageKeys.includes(key)&&storageKeys.push(key);
            }
        }else{
            throw new TypeError("您传递的参数格式不正确,格式为(key,value)或者({key:value})")
        
        }
        //
        this.pageName&&localStorage.setItem(`${this.pageName}:page`,this.storageKeys.join(","));
    }
    removeStorage(filterkeys=[],...args){
        if(!this.pageName){
            filterkeys.length&&filterkeys.forEach(key=>localStorage.removeItem(key));
            return;
        }
        if(!args||args.length===0){
            //避免因为页面刷新，导致storageKeys为空，到时缓存清除不了的问题
            let storageKeys=this.storageKeys;
            let pageKeysStr=localStorage.getItem(`${this.pageName}:page`);
            if(storageKeys.length===0&&pageKeysStr){
                storageKeys.pageKeysStr.split(",");
            }
            storageKeys.filter(key=>!filterkeys.includes(key)).forEach(key=>localStorage.removeItem(key));
        }else{
            args.filter(key=>!filterkeys.includes(key)).forEach(key=>localStorage.removeItem(key));
        };
        localStorage.removeItem(`${this.pageName}:page`);
    }
    getStorage(...args){
        if(args.length===1){
            return this.resolveObjectValue(args[0]);
        }
        return args.reduce((obj,key)=>{
            obj[kay]=this.resolveObjectValue(key);
            return obj;
        },{})
    }
    /**
     * 处理value是Object的情况
     * @param {String} key 
     */
    resolveObjectValue(key){
        let value=localStorage.getItem(key);
        if(typeof value==="string"&&value.slice(-15)==="[object Object]"){
            value=JSON.parse(value.slice(0,-15));
        }
        return value;
    }
}
export const getLocalStorageInstance=pageName=>new LocalStorageClass(pageName);