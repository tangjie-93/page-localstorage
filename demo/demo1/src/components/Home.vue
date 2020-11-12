<template>
	<div class="hello">
		<h1>{{ msg }}</h1>
		<button @click="setCookieForPage('UserInfo')">跳转到用户信息页面</button>
		<button @click="setCookieForPage('Detail')">跳转到详情页面</button>
		<!-- <button @click="setCookie">设置缓存</button>
		<button @click="getCookie">获取缓存</button> -->
		<button @click="removeCookie('UserInfo')">清除用户管理页面缓存</button>
		<button @click="removeCookie('Detail')">清除详情页面缓存</button>
		<button @click="removeCookie()">清除所有页面的缓存</button>
		<router-link to="/detail"/>
    	<router-link to="/userinfo"/>
		<router-view/>
	</div>
</template>

<script>
import { getLocalStorageInstance } from '@tangjie/page-localstorage';

export default {
	name: 'HelloWorld',
	components: {
		UserInfo: () => import('./UserInfo'),
		Detail: () => import('./Detail'),
	},
	props: {
		msg: String,
	},
	data(){
		return {
			setStorage:null
		}
	},
	methods: {
		removeCookie(pageName) {
			//  getLocalStorageInstance(pageName).removeStorage();
			if(pageName){
			  return getLocalStorageInstance(pageName).removeStorage();
			}
			console.log(getLocalStorageInstance());
			return getLocalStorageInstance().removeAllPageStorage();
			
		},
		setUserInfoCookie() {
			this.setStorage({
				name: 'jamestang',
				age: '18',
				userInfo: {
					addr: '广州',
					comp: 'XXX',
				},
			});
			this.$router.push("/userInfo");

		},
		setDetailCookie() {
			this.setStorage({
				tel:'132145267567',
				qq:"4325634748",
			});
			this.$router.push("/detail")
		},
		setCookieForPage(pageName){
			const { setStorage,removeStorage } = getLocalStorageInstance(pageName);
			this.setStorage=setStorage;
			if(pageName==="Detail"){
				this.setDetailCookie();
			}
			if(pageName==="UserInfo"){
				this.setUserInfoCookie();
			}
		}
	},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
	margin: 40px 0 0;
}
ul {
	list-style-type: none;
	padding: 0;
}
li {
	display: inline-block;
	margin: 0 10px;
}
a {
	color: #42b983;
}
</style>
