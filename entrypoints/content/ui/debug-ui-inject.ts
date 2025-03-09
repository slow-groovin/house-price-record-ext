import {ContentScriptContext, createShadowRootUi} from "wxt/client";
import {onMessage} from "@/messaging";
import {createApp} from "vue";
import DebugUI from "@/entrypoints/content/ui/DebugUI.vue";
import {useDevSetting} from "@/entrypoints/reuse/global-variables";
import ContentUIContainer from "@/components/layout/ContentUIContainer.vue";

export function debugUIInject(ctx: ContentScriptContext) {
	console.log('[debugUIInject]')
	const {isDebug}=useDevSetting()


	if(isDebug){
		onParseMessage()
	}

	createShadowRootUi(ctx, {
		name: 'house-ui',
		position: 'modal',
		zIndex:9999,
		anchor: 'html',
		append:"first",
		mode:'closed',
		onMount: (container, _shadow, shadowHost) => {
			const app = createApp(DebugUI);
			_shadow.querySelector('html')?.removeAttribute('style') //必须有这个, 否则modal下shadowRoot占据全部页面导致原始页面无法点击
			app.mount(container);
			return app;
		},
		onRemove: (app) => {
			// Unmount the app when the UI is removed
			app?.unmount();
		}
	}).then(ui=>{
		// 4. Mount the UI
		ui.mount();
	})


}

function onParseMessage() {
	console.log('[message listen] listen simple message')
	onMessage('simple', async ({data})=>{
		console.log('[message][simple]'+data)
		if(data==='parse'){
			return  {text:document.title,url: window.location.href}
		}
		return "content.js:simple:response"
	})
}