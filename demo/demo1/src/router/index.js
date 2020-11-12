import VueRouter from "vue-router";
import Vue from "vue";
Vue.use(VueRouter);
export default new VueRouter({
    routes:[
        {
            path:"/",
            name:'index',
            component:()=>import("@/components/Home.vue"),
            children:[
                {
                    path:"/detail",
                    name:"detail",
                    component:()=>import("@/components/Detail")
                },
                {
                    path:"/userInfo",
                    name:"userInfo",
                    component:()=>import("@/components/UserInfo")
                }
            ]
        },
       
    ]
})
