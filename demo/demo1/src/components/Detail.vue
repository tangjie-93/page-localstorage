<template>
    <div>详情页面</div>
</template>
<script>
import { getLocalStorageInstance } from '@tangjie/page-localstorage';
const { getStorage } = getLocalStorageInstance('Detail');
export default {
    name:"userinfo",
    created(){
     const data=   getStorage();
    }
}
</script>