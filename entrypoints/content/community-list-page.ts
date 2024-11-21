import {ContentScriptContext} from "wxt/client";
import {communityElementDisguise, injectFuzzyStyle} from "@/entrypoints/content/lj-disguise";
import {onMessage,sendMessage} from "webext-bridge/content-script";
import CommunityListUI from "@/entrypoints/content/CommunityListUI.vue";
import {parseAllOfCommunity} from "@/entrypoints/content/community-dom-parse";
export async function communityListPageEntry(ctx:ContentScriptContext) {
	registerMessage()

	// injectFuzzyStyle()
	// communityElementDisguise()

	const ui=await createShadowRootUi(ctx, {
		name: 'example-ui',
		position: 'modal',
		zIndex:9999,
		anchor: 'html',
		append:"first",
		mode:'closed',
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

function registerMessage(){
	onMessage('simple', async (data)=>{
		console.log('RECEIVE simple msg',data)
		if(data.data=='createRecord'){
			console.log('begin crawl for record.')
			return await parseAllOfCommunity()
		}
		// else if(data.data=='c record'){
		// 	return 'crawl ok'
		// }


	})

	onMessage('parseOneCommunityListOnePage',async (data)=>{
		console.log('RECEIVE parseOneCommunityListOnePage msg')
		return await parseAllOfCommunity()
	})
}