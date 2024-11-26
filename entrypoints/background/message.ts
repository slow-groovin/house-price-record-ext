import {onMessage, sendMessage} from "webext-bridge/background";
import {execManualRunCrawlOne, execManualRunCrawlOneFromStart} from "@/entrypoints/reuse/community-control";
import {genCommunityPageUrl} from "@/utils/lj-url";

export function registerCommunityTaskManualRunCrawlOne() {
	//开始一个单个抓取解析任务 manualRunOneCommunityTask, 抓取,解析,新增record, 更新task
	onMessage('manualRunOneCommunityTask', async (msg) => {
		const {cid,city,maxPage,fromStart}=msg.data
		if(!fromStart){
			return await execManualRunCrawlOne(msg.data)
		}else{
			console.debug('[manualRunOneCommunityTask], fromStart mode.')
			return await execManualRunCrawlOneFromStart(city,cid) as {resp:string}
		}
	})
	
}