import {onMessage} from "webext-bridge/background";
import {execManualRunCrawlOne, execManualRunCrawlOneFromStart} from "@/entrypoints/reuse/community-control";
import {runHouseTaskManualRunCrawlOne} from "@/entrypoints/reuse/house-control";

export function registerCommunityTaskManualRunCrawlOne() {
	//开始一个单个抓取解析任务 manualRunOneCommunityTask, 抓取,解析,新增record, 更新task
	onMessage('manualRunOneCommunityTask', async (msg) => {
		const {cid, city, maxPage, fromStart} = msg.data
		if (!fromStart) {
			return await execManualRunCrawlOne(msg.data)
		} else {
			console.debug('[manualRunOneCommunityTask], fromStart mode.')
			return await execManualRunCrawlOneFromStart(city, cid) as { resp: string }
		}
	})

}

export function registerCrawlHouseTask() {
	onMessage('crawlHouseTask', async ({data}) => {
		const {hid} = data as { hid: string }
		await runHouseTaskManualRunCrawlOne(hid)
		//fetch
		//302 captcha
		//302
		//404
		//200 normal crawl
		return {resp: 'ok'}
	})
}