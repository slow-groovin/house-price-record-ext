import {onMessage} from "webext-bridge/background"
import {updateRules} from "@/utils/block";
import {db} from "@/utils/client/Dexie";
import {registerCommunityTaskManualRunCrawlOne} from "@/entrypoints/background/message";
import {registerDaoMessage} from "@/entrypoints/background/dao";


export default defineBackground(() => {
	console.log('Load background!', {id: browser.runtime.id});
	updateRules('ljMetricRules')
	updateRules('ljImgRules')
	updateRules('debugRules')


	browser.sidePanel.setPanelBehavior({
		openPanelOnActionClick: true,
	})
	db.debugInfo.add({
		at: new Date().toLocaleString(), msg: " load background.js"
	})


	onMessage('block', (enable) => {
		if (enable) {
			return {resp: 'ok'}
		}
		return {resp: 'nothing'}

	})

	registerCommunityTaskManualRunCrawlOne()
	registerDaoMessage()


});


