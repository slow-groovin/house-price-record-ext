import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  extensionApi: 'chrome',
  modules: ['@wxt-dev/module-vue'],
	imports:{
		presets:[
			{
				package: '@vueuse/core',
				ignore: [
					// exported from `vue`
					'toRef',
					'toRefs',
					'toValue',
					// exported from `wxt/storage`
					'useStorage',
				],
			},
		]

	},
	manifest:{
		permissions:[
			'storage',
			// 'activeTab'
		],
		// action:{},

	},
});
