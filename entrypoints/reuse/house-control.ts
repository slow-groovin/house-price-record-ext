import {isHouseTaskExist} from "@/entrypoints/background/dao";
import {CommunityListPageItem, HouseItem, HouseTask} from "@/types/lj";
import {sendMessage} from "webext-bridge/background";
import {genHousePageUrl} from "@/utils/lj-url";

import {db} from "@/utils/client/Dexie";

export async function runHouseTaskManualRunCrawlOne(hid: string) {
	//verify task
	let task = await db.houseTasks.where('hid').equals(hid).first();
	if(!task){
		throw new Error(`hTask ${hid} not exist!`)
	}
	const url=genHousePageUrl(task.city,task.hid)
	//open Page
	let promise = new Promise<CommunityListPageItem>(async (resolve, reject) => {
		browser.tabs.create({url}, async (tab) => {
			console.log('runHouseTaskManualRunCrawlOne open:', url, tab.id, tab.status)

			const rs=await crawlHouse(tab.id)
			console.log('rs',rs)
			resolve(true)
			//打开之后, 通过message发送命令, 让页面进行页面信息解析并返回解析结果, 等待爬取结果
			// const resp = await sendMessage('parseOneCommunityListOnePage', {}, 'content-script@' + tab.id)
			// console.log('one tab record resp:', resp)
			// browser.tabs.remove([tab.id as number])
			// resolve(resp)
		})
	})
}

/**
 * 开启一次爬取, 向content发送message, 根据页面抓取结果更新任务自身,以及新建changes
 * @param pageTabId
 */
export async function crawlHouse(pageTabId:number){
	//发送message ,让页面进行parse item
	const respParsedItem = await sendMessage('parseHouse', {}, 'content-script@'+pageTabId)
	console.log('respParsedItem:',respParsedItem)
	//查询任务 in db
	const queryResult=await db.houseTasks.where('hid').equals(respParsedItem.hid).first()

	if(!queryResult){
		throw new Error('task not create:'+respParsedItem.hid)
	}

	//构建task对象(否则成员函数不生效)
	const houseTask=HouseTask.fromHouseTask(queryResult)
	//标记当前任务今天的crawl记录
	houseTask.markAccess()


	/**
	 * 本函数内 所有更新行为发生的时刻
	 */
	let sameAt = Date.now();


	//更新task, 如果有字段更新, 构建更新对象
	const {dexieUpdateChanges,commonFieldChanges}=genTaskUpdateChanges(houseTask,respParsedItem)
	console.log('dexieUpdateChanges',dexieUpdateChanges)
	await db.houseTasks.update(houseTask.id,{
		...dexieUpdateChanges,
		lastRunningAt: sameAt,
		accessRecord:houseTask.accessRecord
	})



	//如果price发生变动, 增加houseChanges记录
	if(respParsedItem.totalPrice && houseTask?.totalPrice!==respParsedItem.totalPrice){
		await db.houseChanges.add({
			hid: respParsedItem.hid,
			cid: respParsedItem.cid,
			at: sameAt,
			oldValue: houseTask.totalPrice??-1,
			newValue: respParsedItem.totalPrice,
		})
	}

	//如果有非价格的信息字段的更新, 则也记录
	if(commonFieldChanges.length>0){
		await db.houseCommonFieldChanges.bulkAdd(commonFieldChanges.map(c=>({
			at: sameAt, cid: houseTask.cid, hid: houseTask.hid, name: c.name, newValue: c.newValue, oldValue: c.oldValue
		})))
	}

	return {houseTask,respParsedItem}
}


/**
 * Prompt: 实现一个函数，用于找出HouseTask中需要更新的字段，生成: 1.适合Dexie.js的更新结构 2.非价格字段(需要记录的变更的通用字段)
 * 简介: 此函数比较两个对象(HouseTask 和 HouseItem)的公共字段，生成需要更新的字段和变更列表。
 *
 * @param houseTask - 当前的HouseTask实例。
 * @param respParsedItem - 新的HouseItem数据，需与当前任务比较。
 * @returns 包含Dexie.js更新所需的字段和字段变更列表的对象。
 */
export function genTaskUpdateChanges(
	houseTask: HouseTask,
	respParsedItem: HouseItem
): {
	dexieUpdateChanges: Record<keyof HouseTask, any>;
	commonFieldChanges: { name: string; newValue: any; oldValue: any }[];
} {
	// 定义需要比较的字段，排除状态字段和不可变字段
	const fieldsToCheck: (keyof HouseItem)[] = [
		"totalPrice",
		"unitPrice",
		"area",
		"name",
		"onSellDate",
		"orientation",
		"buildingType",
		"yearBuilt",
		"roomType",
		"roomSubType",
		"orientation",
		"realArea",
		"realUnitPrice"
	];
	//记录common change时需要排除的价格字段
	const fieldsExcludeInCommonChange:(keyof HouseItem)[] = [
		"unitPrice",
		"realUnitPrice",
		"totalPrice",
	];

	const dexieUpdateChanges: Record<string, any> = {}; // Dexie更新结构
	const commonFieldChanges: { name: string; newValue: any; oldValue: any }[] = []; // 变更记录列表

	// 遍历需要比较的字段
	fieldsToCheck.forEach((field) => {
		const oldValue = houseTask[field];
		const newValue = respParsedItem[field];

		// 仅在新值和旧值不相等时记录
		if (newValue !== undefined && newValue !== null && oldValue !== newValue) {
			dexieUpdateChanges[field] = newValue; // 添加到更新结构
			if(oldValue!==undefined && oldValue!=null && !fieldsExcludeInCommonChange.includes(field)){
				commonFieldChanges.push({ name: field, newValue, oldValue }); // 添加到变更记录
			}
		}
	});

	return { dexieUpdateChanges, commonFieldChanges };
}