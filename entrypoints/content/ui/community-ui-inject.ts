import CommunityContentUI from "@/entrypoints/content/ui/CommunityContentUI.vue";
import { sendMessage } from "@/messaging";
import { createApp } from "vue";
import { ContentScriptContext, createShadowRootUi } from "wxt/client";

export async function communityPageUIInject(ctx: ContentScriptContext) {
	const ui = await createShadowRootUi(ctx, {
		name: 'community-ui',
		position: 'modal',
		zIndex: 99999,
		anchor: 'html',
		append: "first",
		mode: 'closed',
		onMount: (container, _shadow, shadowHost) => {
			const app = createApp(CommunityContentUI);
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

	const tabId=await sendMessage('echoTabId','')
	console.log('tabId:',tabId)
}

