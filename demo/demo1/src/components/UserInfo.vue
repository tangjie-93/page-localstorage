<template>
    <div>用户信息</div>
</template>
<script>
import { getLocalStorageInstance } from '@tangjie/page-localstorage';
const { getStorage } = getLocalStorageInstance('UserInfo');
export default {
    name:"userinfo",
    created(){
     const data=   getStorage();
    }
}
</script>