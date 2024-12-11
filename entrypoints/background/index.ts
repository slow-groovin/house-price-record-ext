import "webext-bridge/background";
import {onMessage} from "webext-bridge/background"
import {clearRules, updateRules} from "@/entrypoints/reuse/block";
import {db} from "@/utils/client/Dexie";
import {registerSimpleMessage} from "@/entrypoints/background/message";
import {registerBrowserStorageLocalMessage, registerDaoMessage} from "@/entrypoints/background/dao";
import {defineBackground} from "wxt/sandbox";
import {browser} from "wxt/browser";

export default defineBackground(() => {
	console.log(`[${new Date().toLocaleString()}]`,'Load background!', {id: browser.runtime.id});
	clearRules().then(()=>{
		updateRules('ljMetricRules')
		updateRules('ljImgRules')
		updateRules('debugRules')
	})


	// if (typeof chrome !== "undefined" && chrome.sidePanel) {
	// 	// Chrome 或 Edge
	// 	chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
	// } else if (typeof browser !== "undefined" && browser.sidebarAction) {
	// 	// Firefox
	// 	browser.sidebarAction.setPanel({ panel: "sidebar.html" });
	// } else {
	// 	console.log("Side Panel API not supported in this browser.");
	// }
	// browser.sidebarAction.setPanel({ panel: "sidebar2.html" });

	db.debugInfo.add({
		at: new Date().toLocaleString(), msg: " load background.js"
	})


	onMessage('block', (enable) => {
		if (enable) {
			return {resp: 'ok'}
		}
		return {resp: 'nothing'}

	})

	onMessage('openOptionPage',(msg)=>{
		console.debug('[openOptionPage]',msg.data)
		return browser.tabs.create({url:msg.data})
	})
	registerDaoMessage()
	registerBrowserStorageLocalMessage()
	registerSimpleMessage()

});


