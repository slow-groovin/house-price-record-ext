import { createApp } from 'vue';
import '~/assets/tailwind.css';
import '~/assets/shacn.css'
import App from './App.vue';
import {createRouter, createWebHashHistory} from "vue-router";
import Index from "@/entrypoints/options/pages/Index.vue";
import OptionDebugEntry from "@/entrypoints/options/pages/OptionDebugEntry.vue";
const router=createRouter({
	history: createWebHashHistory(),
	routes:[
		{path:'/',component:Index},
		{path:'/debug',component:OptionDebugEntry}
	]

})
createApp(App).use(router).mount('#app');
