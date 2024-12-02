import {ContentScriptContext, createShadowRootUi} from "wxt/client";
import {createApp} from "vue";
import HouseContentUI from "@/entrypoints/content/HouseContentUI.vue";

export async function houseContentUIMount(ctx:ContentScriptContext) {
	console.log('[houses]content ui mounted')
	const ui=await createShadowRootUi(ctx, {
		name: 'house-ui',
		position: 'modal',
		zIndex:9999,
		anchor: 'html',
		append:"first",
		mode:'closed',
		onMount: (container, _shadow, shadowHost) => {
			const app = createApp(HouseContentUI);
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