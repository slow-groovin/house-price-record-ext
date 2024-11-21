import {CommunityListPageItem, CommunityRecord} from "@/types/lj";
import {onMessage, sendMessage} from "webext-bridge/background"
import {db} from "@/utils/client/Dexie";
import {stabilizeFields} from "@/utils/variable";
import {removeRepeat} from "@/utils/array";
import {toInt} from "radash";

export function registerCommunityTaskManualRunCrawlOne() {
	//通过message接受这个命令:manualRunOneCommunityTask
	onMessage('manualRunOneCommunityTask', async (msg) => {
		return runCommunityTaskManualRunCrawlOne(msg.data.urlList)
	})
}

async function runCommunityTaskManualRunCrawlOne(urlList: string[]) {
	const promises: Promise<CommunityListPageItem>[] = []
	//依次打开所有参数中的所有url
	for (const url of urlList) {
		let promise = new Promise<CommunityListPageItem>(async (resolve, reject) => {
			browser.tabs.create({url}, async (tab) => {
				console.log('manualRunOneCommunityTask open:', url, tab.id, tab.status)

				//打开之后, 通过message发送命令, 让页面进行页面信息解析并返回解析结果, 等待爬取结果
				const resp = await sendMessage('parseOneCommunityListOnePage', {}, 'content-script@' + tab.id)
				console.log('one tab record resp:', resp)
				// browser.tabs.remove([tab.id as number])
				resolve(resp)
			})

		});
		promises.push(promise)
	}

	//等待所有的promise结果,
	const recordsOfAllPage = await Promise.all(promises)
	console.log('manualRunOneCommunityTask:', 'all done.', recordsOfAllPage)

	verifyDiffPagesItem(recordsOfAllPage)

	const record = pageItemResults2Record(recordsOfAllPage)
	//查询上一个record
	//如果存在, 计算priceUp,priceDown, added,removed,


	const sameAt = Date.now()
	record.at = sameAt
	// record 入库
	const lastRecord = await db.communityRecords.add(record)

	//更新task lastRunningAt
	const {avgUnitPrice,onSellCount,visitCountIn90Days,doneCountIn90Days}=record

	await db.communityTasks.where('cid').equals(record.cid).modify({
		lastRunningAt: sameAt,

	})
	return {resp: 'manualRunOneCommunityTask open urls done. ' + lastRecord}
}

/**
 * pageItem[] -> record存储
 */
function pageItemResults2Record(recordsOfAllPage: CommunityListPageItem[]) {
	const at = Date.now()

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
		at,
		houseList: removeRepeat(houseList, h => h.hid),
	}
	//计算数值
	record.avgTotalPrice= Math.floor(record.houseList.reduce((acc, cur) => acc + cur.price, 0) / record.houseList.length)
	record.calcOnSellCount= record.houseList.length

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

