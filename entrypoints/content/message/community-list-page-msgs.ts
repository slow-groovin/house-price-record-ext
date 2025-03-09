import { onMessage } from "@/messaging"
import { parseAllOfCommunity } from "../util/community-dom-parse"

export function communityListPageOnMessages() {
	onMessage('simple', async (data) => {
		console.log('RECEIVE simple msg', data)
		if (data.data == 'createRecord') {
			console.log('begin crawl for record.')
			return await parseAllOfCommunity()
		}
		return 'simple from community-list page'
	})


	/**
	 * 解析当前列表页面, 并返回解析结果
	 */
	onMessage('parseOneCommunityListOnePage', async (data) => {
		console.log('RECEIVE parseOneCommunityListOnePage msg')
		return await parseAllOfCommunity()
	})
	console.log('[onMsg]parseOneCommunityListOnePage')
}