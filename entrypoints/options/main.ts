import { createApp } from 'vue';
import '~/assets/tailwind.css';
import '~/assets/shacn.css'
import App from './App.vue';
import {createRouter, createWebHashHistory} from "vue-router";
import Index from "@/entrypoints/options/pages/Index.vue";
import OptionDebugEntry from "@/entrypoints/options/pages/OptionDebugEntry.vue";
import MainLayout from "@/entrypoints/options/pages/layout/MainLayout.vue";
import HomePage from "@/entrypoints/options/pages/HomePage.vue";
const router=createRouter({

	history: createWebHashHistory(),
	routes:[
		{
			path:'/',
			component:MainLayout,
			children:[
				{
					path:'/',
					component: HomePage,
				}
			]
		},
		{path:'/debug',component:OptionDebugEntry}
	]


})
console.log("init options vue")
createApp(App).use(router).mount('#app');
