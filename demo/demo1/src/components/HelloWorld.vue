<template>
	<div class="hello">
		<h1>{{ msg }}</h1>
		<button @click="userClick">跳转到用户信息页面</button>
		<button @click="detailClick">跳转到详情页面</button>
		<button @click="setCookie">设置缓存</button>
		<button @click="getCookie">获取缓存</button>
		<button @click="removeCookie">清除缓存</button>
	</div>
</template>

<script>
import { getLocalStorageInstance } from '@tangjie/page-localstorage';
const { setStorage, getStorage, removeStorage } = getLocalStorageInstance('Detail');
export default {
	name: 'HelloWorld',
	components: {
		UserInfo: () => import('./UserInfo'),
		Detail: () => import('./Detail'),
	},
	props: {
		msg: String,
	},
	methods: {
		setCookie() {
			const obj = {
				a: 123,
			};
			setStorage({
				name: 'jamestang',
				age: '18',
				userInfo: {
					addr: '广州',
					comp: 'XXX',
				},
			});
		},
		getCookie() {
			const { name, age, userInfo } = getStorage('name', 'age', 'userInfo', {});
			console.log(name, age, userInfo);
			// getStorage({});
		},
		removeCookie() {
			removeStorage('Detail');
			removeStorage([{}]);
		},
		userClick() {},
		detailClick() {},
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
