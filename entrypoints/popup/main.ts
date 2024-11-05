import { createApp } from 'vue';
import '~/assets/tailwind.css';
import '~/assets/shacn.css'
import App from './App.vue';
import {createRouter, createWebHashHistory} from "vue-router";
import Index from "@/entrypoints/popup/pages/Index.vue";
const router=createRouter({
	history: createWebHashHistory(),
	routes:[
		{path:'/',component:Index},

	]

})
createApp(App).use(router).mount('#app');
