import {ContentScriptContext, createShadowRootUi} from "wxt/client";
import {communityElementDisguise, injectFuzzyStyle} from "@/entrypoints/content/lj-disguise";
import {onMessage} from "@/messaging";
import CommunityListUI from "@/entrypoints/content/CommunityContentUI.vue";
import {parseAllOfCommunity} from "@/entrypoints/content/community-dom-parse";
import {createApp} from "vue";
import {useDevSetting} from "@/entrypoints/reuse/global-variables";

export async function communityListPageEntry(ctx: ContentScriptContext) {
	console.log("[content.js][community list page]")
	const {isDisguise} = useDevSetting()

	registerMessage()

	if (isDisguise) {
		injectFuzzyStyle()
		communityElementDisguise()
	}


	const ui = await createShadowRootUi(ctx, {
		name: 'community-ui',
		position: 'modal',
		zIndex: 9999,
		anchor: 'html',
		append: "first",
		mode: 'closed',
		onMount: (container, _shadow, shadowHost) => {

			const app = createApp(CommunityListUI);
			console.log()
			_shadow.querySelector('html')?.removeAttribute('style') //必须有这个, 否则modal下shadowRoot占据全部页面导致原始页面无法点击
			app.mount(container);
			return app;
		},
		onRemove: (app) => {
			// Unmount the app when the UI is removed
			app?.unmount();
		}
	});
	// 4. Mount the UI
	ui.mount();
}

function registerMessage() {
	onMessage('simple', async (data) => {
		console.log('RECEIVE simple msg', data)
		if (data.data == 'createRecord') {
			console.log('begin crawl for record.')
			return await parseAllOfCommunity()
		}
		// else if(data.data=='c record'){
		// 	return 'crawl ok'
		// }


	})
	/**
	 * 解析当前列表页面, 并返回解析结果
	 */
	onMessage('parseOneCommunityListOnePage', async (data) => {
		console.log('RECEIVE parseOneCommunityListOnePage msg')
		return await parseAllOfCommunity()
	})


}