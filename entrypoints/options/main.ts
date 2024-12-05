import {createApp} from 'vue';
import '~/assets/tailwind.css';
import '~/assets/shacn.css'
import App from './App.vue';
import {createRouter, createWebHashHistory} from "vue-router";
import OptionDebugEntry from "@/entrypoints/options/pages/OptionDebugEntry.vue";
import MainLayout from "@/entrypoints/options/pages/layout/MainLayout.vue";
import HomePage from "@/entrypoints/options/pages/HomePage.vue";
import HouseTaskList from "@/entrypoints/options/pages/house-task-list/HouseTaskList.vue";
import HouseChangeList from "@/entrypoints/options/pages/house-changes-list/HouseChangeList.vue";
import HouseDetailPage from "@/entrypoints/options/pages/HouseDetailPage.vue";
import CommunityTaskList from "@/entrypoints/options/pages/community-task-list/CommunityTaskList.vue";
import CommunityDetailPage from "@/entrypoints/options/pages/CommunityDetailPage.vue";
import HouseUpdatePreview from "@/entrypoints/options/pages/HouseUpdatePreview.vue";
import { VueQueryPlugin } from '@tanstack/vue-query'
import CommunityUpdatePreview from "@/entrypoints/options/pages/CommunityUpdatePreview.vue";
import HouseStatusChangeList from "@/entrypoints/options/pages/house-changes-list/HouseStatusChangeList.vue";
import CommunityRecordPage from "@/entrypoints/options/pages/CommunityRecordPage.vue";


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
				},
				{path:'/debug',component:OptionDebugEntry},
				{path:'/h/task/list',component:HouseTaskList},
				{path:'/h/task/change',component:HouseChangeList},
				{path:'/h/task/status/change',component:HouseStatusChangeList},
				{path:'/h/task/detail',component:HouseDetailPage},
				{path:'/c/task/list',component:CommunityTaskList},
				{path:'/c/task/detail',component:CommunityDetailPage},
				{path:'/c/record',component:CommunityRecordPage},
				{path:'h/update/preview',component:HouseUpdatePreview},
				{path:'c/update/preview',component:CommunityUpdatePreview},

			]
		},
	]

})
console.log("init options vue")

if (import.meta.env.VITE_HIDE === 'true') {
	console.log("import '******.css'")
	import('~/assets/disguise.css');
}

createApp(App).use(router).use(VueQueryPlugin).mount('#app');
