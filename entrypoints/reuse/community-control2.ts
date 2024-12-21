import {CommunityListPageItem, CommunityRecord, CommunityTask} from "@/types/lj";
import {sendMessage} from "@/messaging"
import {db} from "@/utils/client/Dexie";
import {stabilizeFields} from "@/utils/variable";
import {removeRepeat} from "@/utils/array";
import {list, retry} from "radash";
import {genCommunityPageUrl} from "@/utils/lj-url";
import {browser} from "wxt/browser";


const PREFIX = '[oneCommunityEntry]'

/**
 * 打开单独窗口和side panel的start page作为开始
 */
export async function startPageEntry(communityList: CommunityTask[]) {
	let item = {communityList};
	const id = await db.tempBatchCommunity.add(item)
	const newWindow = await browser.windows.create({url: "/options.html#/c/running/notice", state: 'maximized'})
	await chrome.sidePanel.open({windowId: newWindow.id as number})
	await chrome.sidePanel.setOptions({path: '/sidepanel.html#/c/batch?id=' + id})
}

export async function oneCommunityEntry(communityTask: CommunityTask) {
	const {cid, city} = communityTask

	/**
	 * step 1. 获取页面页数
	 */
	const url = genCommunityPageUrl(city as string, cid, 1)
	const tab = await browser.tabs.create({url, active: false})
	console.debug(PREFIX, 'start url: ', url, tab.id)

	let pageItem: CommunityListPageItem | undefined = undefined
	//重试多次
	await retry({times: 10, delay: 1000}, async () => {
		//首先爬取总页数等信息
		pageItem = await sendMessage('parseOneCommunityListOnePage', undefined, tab.id)
		if (!pageItem.maxPageNo || !pageItem.city) {
			throw new Error('pageItem.maxPageNo|city not exist! ' + pageItem)
		}
	})
	//pageItem必不为空, 因为retry失败会抛出异常
	await browser.tabs.remove([tab.id as number])
	let oneRecord = await execOneCommunity({
		cid: pageItem!.cid, city: pageItem!.city!, maxPage: pageItem!.maxPageNo
	})
	return oneRecord
}

export async function execOneCommunity(input: { city: string, cid: string, maxPage: number }) {
	const {city, cid, maxPage} = input
	const promises: Promise<CommunityListPageItem>[] = []
	const urlList = list(1, maxPage).map(page => genCommunityPageUrl(city, cid, page))


	const recordsOfAllPage: CommunityListPageItem[] = []
	//依次打开所有参数中的所有url
	for (const url of urlList) {
		const tab = await browser.tabs.create({url, active: false})
		console.debug('[execOneCommunity] open:', url, tab.id, tab.status)
		let parsedPageItem: CommunityListPageItem | undefined = undefined

		//打开之后, 通过message发送命令, 让页面进行页面信息解析并返回解析结果, 等待爬取结果
		await retry({times: 10, delay: 1000}, async () => {
			parsedPageItem = await sendMessage('parseOneCommunityListOnePage', undefined, tab.id)
		})

		console.debug(`[execOneCommunity] one tab[${url}] record resp:`, parsedPageItem)
		await browser.tabs.remove([tab.id as number])

		recordsOfAllPage.push(parsedPageItem!)
	}

	verifyDiffPagesItem(recordsOfAllPage)


	const record = pageItemResults2Record(recordsOfAllPage)
	return record

}

/**
 * pageItem[] -> record存储
 */
function pageItemResults2Record(recordsOfAllPage: CommunityListPageItem[]): CommunityRecord {
	//创建record对象
	const houseList = []
	for (let item of recordsOfAllPage) {
		houseList.push(...item.houseList)
	}


	const {result: mergeResult, diff, hasDiff} = stabilizeFields(recordsOfAllPage, {excludeFields: ['pageNo']})
	if (hasDiff) {
		console.warn('pages crawl results has diff fields:', diff)
	}

	const record: CommunityRecord = {
		...mergeResult,
		at: Date.now(),
		houseList: removeRepeat(houseList, h => h.hid),
	}
	//计算数值
	record.avgTotalPrice = Math.floor(record.houseList.reduce((acc, cur) => acc + cur.price, 0) / record.houseList.length)
	record.calcOnSellCount = record.houseList.length

	return record
}

/**
 * 校验不同页的结果是否valid
 * @param pagesItem
 */
function verifyDiffPagesItem(pagesItem: CommunityListPageItem[]) {
	/**
	 * hid repeat
	 */
	const hidSet = new Map<string, number[]>()
	pagesItem.forEach(item => {
		item.houseList.forEach(house => {
			if (!hidSet.has(house.hid)) {
				hidSet.set(house.hid, [])
			}
			hidSet.get(house.hid)?.push(item.pageNo)
		})
	})

	const repeatResult = hidSet.entries().filter((v, k) => {
		return v[1].length > 1
	}).toArray()

	if (repeatResult.length > 0) {
		console.warn(`Diff page's data has repeat hid: ${JSON.stringify(repeatResult)}`)
	}
}
