import { createApp } from 'vue';
import '~/assets/tailwind.css'
import '~/assets/shacn.css'
import App from './App.vue';
import {createRouter, createWebHashHistory} from "vue-router";
import Index from "@/entrypoints/sidepanel/pages/Index.vue";
import DebugEntryTabs from "@/components/debug/DebugEntryTabs.vue";
import BatchHouseStart from "@/entrypoints/sidepanel/pages/BatchHouseStart.vue";
const router=createRouter({
	history: createWebHashHistory(),
	routes:[
		{path:'/',component:Index},
		{path: '/debug',component:DebugEntryTabs},
		{path: '/h/batch', component:BatchHouseStart}

	]

})
createApp(App).use(router).mount('#app');
