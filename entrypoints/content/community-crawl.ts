import {genCommunityPageUrl} from "@/utils/lj-url";
import {sendMessage} from "webext-bridge/content-script";
import {list} from "radash";

/**
 * 向background.js发送开始爬取请求
 * @param city
 * @param cid
 * @param maxPage
 */
export async function beginCrawl(city:string,cid:string,maxPage:number){

	const urls=list(1,maxPage).map(pageNo=>genCommunityPageUrl(city,cid,pageNo))
	// urls.forEach(url => {
	// 	 // sendMessage('simple','record:'+url,`content-script@${tab.id}`)
	// });
	console.log('beginCrawl:',urls)
	const result=await sendMessage('manualRunOneCommunityTask',{city,cid, maxPage},`background`)
	console.log(result)
}

