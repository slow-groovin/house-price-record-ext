import { defineConfig } from 'wxt';
import vueJsx from '@vitejs/plugin-vue-jsx'
// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
	dev:{
		server: {
			port:3000,
		}

	},
	modules: ['@wxt-dev/module-vue'],
	imports: false,   // disable auto-import
	// imports:{
	// 	presets:[
	// 		{
	// 			package: '@vueuse/core',
	// 			ignore: [
	// 				// exported from `vue`
	// 				'toRef',
	// 				'toRefs',
	// 				'toValue',
	// 				// exported from `wxt/storage`
	// 				'useStorage',
	// 			],
	// 		},
	// 	]
	//
	// },
	manifest:{
		// "web_accessible_resources": [
		// 	"/*.html"
		// ],
		permissions:[
			'storage',
			'declarativeNetRequestWithHostAccess',
			'declarativeNetRequest',  //申请这个权限才能在dynamic rule中block发送到不同网站的资源, 否则只能block domain自身的
			// 'activeTab',
			"webRequest",
			"webNavigation",
			"webRequestBlocking"
		],
		// action:{},

	},

	// @ts-ignore
	vite: (configEnv)=>({
		plugins: [vueJsx()],
	})
});
