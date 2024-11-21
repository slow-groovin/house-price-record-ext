import {genCommunityPageUrl} from "@/utils/lj-url";
import {sendMessage} from "webext-bridge/content-script";
import {list} from "radash";

/**
 * 向background.js发送开始爬取请求
 * @param city
 * @param cid
 * @param pageCount
 */
export async function beginCrawl(city:string,cid:string,pageCount:number){

	const urls=list(1,pageCount).map(pageNo=>genCommunityPageUrl(city,cid,pageNo))
	// urls.forEach(url => {
	// 	 // sendMessage('simple','record:'+url,`content-script@${tab.id}`)
	// });
	console.log('beginCrawl:',urls)
	const result=await sendMessage('manualRunOneCommunityTask',{urlList:urls},`background`)
	console.log(result)
}

