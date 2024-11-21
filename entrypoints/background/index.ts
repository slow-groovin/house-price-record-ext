import {onMessage, sendMessage} from "webext-bridge/background"
import {updateRules} from "@/utils/block";
import {db} from "@/utils/client/Dexie";


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

	onMessage('manualRunOneCommunityTask', async (msg) => {
		const promises:Promise<any>[]=[]
		for (const url of msg.data.urlList) {
			let promise = new Promise(async (resolve, reject)=> {
				browser.tabs.create({url}, async (tab) => {
					console.log('manualRunOneCommunityTask open:', url, tab.id, tab.status)


					//等待爬取结果
					const resp = await sendMessage('simple', 'createRecord', 'content-script@' + tab.id)
					console.log('one tab record resp:',resp)
					browser.tabs.remove([tab.id as number])
					resolve(resp)
				})

			});
			promises.push(promise)
		}

		//结果汇总, records -> snapshot  存储
		await Promise.all(promises).then(rs=>{
			console.log('manualRunOneCommunityTask:','all done.',rs)
		})

		return {resp:'manualRunOneCommunityTask open urls done.'}
	})


});


