import {CommunityListPageItem, CommunityRecord, HousePriceChangeItem, HousePriceItem, HouseTask} from "@/types/lj";
import {sendMessage} from "webext-bridge/background"
import {db} from "@/utils/client/Dexie";
import {stabilizeFields} from "@/utils/variable";
import {removeRepeat} from "@/utils/array";
import {list} from "radash";
import {genCommunityPageUrl} from "@/utils/lj-url";
import {undefined} from "zod";
import {AccessRecord} from "@/utils/lib/AcessRecord";

/**
 * 先打开标签页并获取页面信息, 再调用 execManualRunCrawlOne
 * @param city
 * @param cid
 */
export async function execManualRunCrawlOneFromStart(city:string,cid:string){
	//先打开标签页并获取页面信息
	return  new Promise<{ resp: string }>((resolve, reject) => {
		const url = genCommunityPageUrl(city, cid, 1)
		console.debug('[execManualRunCrawlOneFromStart], 1. start url: ', url)
		browser.tabs.create({url, active: false}, async (tab) => {
			console.debug('[execManualRunCrawlOneFromStart], 2. opened url suc: ', url)
			const pageItem = await sendMessage('parseOneCommunityListOnePage', {}, 'content-script@' + tab.id)
			browser.tabs.remove([tab.id as number])

			if (!pageItem.city) {
				throw new Error('pageItem.city not exist! ' + pageItem)
			}
			/**
			 * begin execManualRunCrawlOne()
			 */
			console.debug('[execManualRunCrawlOneFromStart], 3. get pageItem suc: ', pageItem)
			const resp = await execManualRunCrawlOne({
				cid: pageItem.cid, city: pageItem.city, maxPage: pageItem.maxPageNo
			})
			console.debug('[execManualRunCrawlOneFromStart], 4. crawl done. return :', resp)
			resolve(resp)
		})

	})
}

/**
 * 抓取,解析,新增record, 更新task
 * @param input
 */
export async function execManualRunCrawlOne(input:{city:string,cid:string,maxPage:number}) {
	const {city,cid,maxPage}=input


	const promises: Promise<CommunityListPageItem>[] = []
	const urlList=list(1,maxPage).map(page=>genCommunityPageUrl(city,cid,page))
	//依次打开所有参数中的所有url
	for (const url of urlList) {
		let promise = new Promise<CommunityListPageItem>(async (resolve, reject) => {
			browser.tabs.create({url,active:false}, async (tab) => {
				console.debug('[execManualRunCrawlOne] open:', url, tab.id, tab.status)

				//打开之后, 通过message发送命令, 让页面进行页面信息解析并返回解析结果, 等待爬取结果
				const resp = await sendMessage('parseOneCommunityListOnePage', {}, 'content-script@' + tab.id)
				console.debug(`[execManualRunCrawlOne] one tab[${url}] record resp:`, resp)
				browser.tabs.remove([tab.id as number])
				resolve(resp)
			})

		});
		promises.push(promise)
	}

	//等待所有的promise结果,
	const recordsOfAllPage = await Promise.all(promises)
	console.debug('[execManualRunCrawlOne]:', 'all done.', recordsOfAllPage)

	verifyDiffPagesItem(recordsOfAllPage)


	const record = pageItemResults2Record(recordsOfAllPage)
	const sameAt = Date.now()
	record.at = sameAt


	//如果设置了"自动创建/更新house任务", 则自动创建不存在的任务
	await autoUpdateOrCreateHouseTask(record)


	//查询上一个record
	const lastRecord = await db.communityRecords.where('cid').equals(record.cid).last()
	//如果存在, 计算priceUp,priceDown, added,removed,
	if (lastRecord?.houseList && lastRecord?.houseList.length > 0) {
		const {
			priceUpList,
			priceDownList,
			removedItem,
			addedItem
		} = calculateListDifferences(record.houseList, lastRecord.houseList)

		record.priceUpList = priceUpList
		record.priceDownList = priceDownList
		record.removedItem = removedItem
		record.addedItem = addedItem
	}



	// record 入库
	record.houseList=record.houseList.map(({price,hid})=>({hid,price}))
	const insertId = await db.communityRecords.add(record)
	console.log('[execManualRunCrawlOne]record insertId:', insertId)

	/**
	 * 更新task: 字段  lastRunningAt
	 */

	let task=await db.communityTasks.where('cid').equals(record.cid).first()
	if(!task)
		throw new Error('task should exist! :',record.cid)

	let accessRecord = AccessRecord.fromAccessRecord(task.accessRecord);
	accessRecord.setAccessStatus(new Date(),true)

	await db.communityTasks.update(task.id,{
		lastRunningAt: sameAt,
		accessRecord: accessRecord,
		avgTotalPrice: record.avgTotalPrice,

		avgUnitPrice: record.avgUnitPrice,
		doneCountIn90Days: record.doneCountIn90Days,
		visitCountIn90Days: record.visitCountIn90Days,
		onSellCount: record.onSellCount,

		runningCount: task.runningCount+1,

	})
	/**
	 * 更新task 完毕
	 */
	return {resp: 'execManualRunCrawlOne open urls done. ' + JSON.stringify(lastRecord)}
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

/**
 * 计算并赋值record中几个表示相对于前一个变化值字段
 * 	priceUpList
 * 	priceDownList
 * 	removedItem
 * 	addedItem
 */
export function calculateListDifferences(target: HousePriceItem[], toCompare: HousePriceItem[]) {
	// 用于快速检索 toCompare 中的项
	const toCompareMap = new Map(toCompare.map((item) => [item.hid, item]));

	const priceUpList: HousePriceChangeItem[] = [];
	const priceDownList: HousePriceChangeItem[] = [];
	const removedItem: HousePriceItem[] = [];
	const addedItem: HousePriceItem[] = [];

	// 遍历 target 的每个项
	target.forEach((item) => {
		const compareItem = toCompareMap.get(item.hid);
		// 若 `hid` 不存在于 toCompare 中，标记为新增项
		if (!compareItem) {
			addedItem.push(item);
		}
		// 若存在相同 `hid`，对比价格
		if (compareItem) {
			if (item.price > compareItem.price) {
				priceUpList.push({...item, oldPrice: compareItem.price}); // 价格上升
			} else if (item.price < compareItem.price) {
				priceDownList.push({...item, oldPrice: compareItem.price}); // 价格下降
			}
			toCompareMap.delete(item.hid); // 标记已处理
		}
	});

	// 剩余的 toCompare 项为被移除的项
	removedItem.push(...toCompareMap.values());

	// 返回对比结果
	return {priceUpList, priceDownList, removedItem, addedItem};
}

/**
 * 为record中的houseList中的所有item自动创建任务或更新
 * @param record
 */
async function autoUpdateOrCreateHouseTask(record:CommunityRecord){
	for (let item of record.houseList) {
		const task=await db.houseTasks.where('hid').equals(item.hid).first()
		if(task){
			//update price
			//如果price发生变动, 增加houseChanges记录
			if(item.price && task?.totalPrice!==item.price){
				await db.houseChanges.add({

					hid: item.hid,
					cid: record.cid,
					at: record.at,
					oldValue: task.totalPrice??-1,
					newValue: item.price,
				})
			}
			const taskObj=HouseTask.fromHouseTask(task)
			taskObj.markAccess()

			await db.houseTasks.where('id').equals(task!.id as number).modify(taskObj)


		}else{
			//create task
			if(!record.city){
				console.error('record has no city!', record.city)
				return
			}

			let houseTask = HouseTask.newFromItem({...item,city:record.city,cid:record.cid});
			houseTask.markAccess()
			await db.houseTasks.add(houseTask)

		}
	}
}
