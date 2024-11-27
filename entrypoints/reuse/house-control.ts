import {HouseItem, HouseTask} from "@/types/lj";
import {sendMessage} from "webext-bridge/background";
import {genHousePageUrl, isCaptchaPage, isSoldHousePage} from "@/utils/lj-url";
import {db} from "@/utils/client/Dexie";

import {browser} from "wxt/browser";

/**
 * 从background/popup调用, 对一个house进行抓取,更新
 * @param hid
 */
export async function runHouseTaskManualRunCrawlOne(hid: string) {
	/*
	 * verify task in db
	 */
	let task = await db.houseTasks.where('hid').equals(hid).first();
	if(!task){
		throw new Error(`hTask ${hid} not exist!`)
	}
	const url=genHousePageUrl(task.city,task.hid)
	/*
	verify status
	 */
	const fetchRs=await fetch(url)
	if(fetchRs.status===404){
		//update status: miss
		updateTaskMiss()
	}else if(fetchRs.status===302){
		if(isCaptchaPage(fetchRs.url)){
			throw new Error('counter captcha!')
		}else if(isSoldHousePage(fetchRs.url)){
			handleSoldPage()
		}else{
			throw new Error('unknown redirect!:'+fetchRs.url)
		}

	}else if(fetchRs.status===200){
		const tab=await browser.tabs.create({url})
		if(!tab.id){
			throw new Error('tab id is undefined.')
		}
		await handleNormalPage(tab.id)
	}


}
async function updateTaskMiss(){

}
async function handleSoldPage(){

}


/**
 * 开启一次爬取, 向content发送message, 根据页面抓取结果更新任务自身,以及新建changes
 * @param pageTabId
 */
export async function handleNormalPage(pageTabId:number){
	//发送message ,让页面进行parse item
	const respParsedItem = await sendMessage('parseHouse', {}, 'content-script@'+pageTabId)
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