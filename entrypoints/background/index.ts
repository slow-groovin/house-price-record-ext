
import {onMessage} from "@/messaging"
import {clearRules, addRules} from "@/entrypoints/reuse/block";
import {db} from "@/utils/client/Dexie";
import {registerSimpleMessage} from "@/entrypoints/background/message";
import {registerBrowserStorageLocalMessage, registerDaoMessage} from "@/entrypoints/background/dao";
import {defineBackground} from "wxt/sandbox";
import {browser} from "wxt/browser";
import {useDevSetting} from "@/entrypoints/reuse/global-variables";

export default defineBackground(() => {
	console.log(`[${new Date().toLocaleString()}]`,'Load background!', {id: browser.runtime.id});

	const {isDebug}=useDevSetting()
	clearRules().then(()=>{
		addRules()
	})

	if (typeof chrome !== "undefined" && chrome.sidePanel) {
		// Chrome 或 Edge
		// chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

	} else if (typeof browser !== "undefined" && browser.sidebarAction) {
		// Firefox
		// browser.sidebarAction.setPanel({ panel: "sidebar.html" });
	} else {

	}
	// browser.sidebarAction.setPanel({ panel: "sidebar2.html" });

	// db.debugInfo.add({
	// 	at: new Date().toLocaleString(), msg: " onInstalled in background.js"
	// })


	onMessage('openOptionPage',async (msg)=>{
		console.debug('[openOptionPage]',msg.data)
		return browser.tabs.create({url:msg.data})
	})
	registerDaoMessage()
	registerBrowserStorageLocalMessage()
	// registerSimpleMessage()

	browser.runtime.onInstalled.addListener(()=>{
		if (typeof chrome === "undefined" ||  !(chrome.sidePanel)) {
			console.error("Side Panel API not supported in this browser.");
			browser.tabs.create({url:'/options.html#/not-support'});
		}
		if(!isDebug){
			browser.tabs.create({url:'/options.html#/'})
		}
	})


});


