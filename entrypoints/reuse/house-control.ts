import {HouseItem, HouseTask, HouseTaskStatus} from "@/types/lj";
import {sendMessage} from "webext-bridge/background";
import {genHousePageUrl, isCaptchaPage, isLoginPage, isHouseSoldPage} from "@/utils/lj-url";
import {db} from "@/utils/client/Dexie";

import {browser} from "wxt/browser";

const LOG_PREFIX = '[house-control]'

/**
 * 从background/popup调用, 对一个house进行抓取,更新
 * @param hid
 */
export async function runHouseTaskManualRunCrawlOne(hid: string) {
	const LOG_PREFIX = `[house-control][hid:${hid}]`
	console.log(LOG_PREFIX, 'begin ')
	/*
	 * verify task in db
	 */
	let task = await db.houseTasks.where('hid').equals(hid).first();
	if (!task) {
		throw new Error(`${LOG_PREFIX} hid: ${hid} not exist!`)
	}
	const url = genHousePageUrl(task.city, task.hid)
	/*
	verify status
	 */
	const fetchRs = await fetch(url)
	if (fetchRs.status === 404) { //update status: miss
		console.log(LOG_PREFIX, 'house miss')

		await updateTaskMiss(task)
	} else if (fetchRs.status === 200 && fetchRs.redirected) { //redirect
		if (isCaptchaPage(fetchRs.url)) {  //  captcha
			throw new Error(LOG_PREFIX + 'counter captcha!')
		} else if (isHouseSoldPage(fetchRs.url)) {  //sold
			console.log(LOG_PREFIX, 'house sold')

			const tab = await browser.tabs.create({url})
			if (!tab.id) {
				throw new Error(LOG_PREFIX + 'tab id is undefined.')
			}
			await handleSoldPage(tab.id, task)
		}else if(isLoginPage(fetchRs.url)){ //login
			throw new Error(LOG_PREFIX + 'login required!')
		}
		else {
			throw new Error(LOG_PREFIX + 'unknown redirect!:' + fetchRs.url)
		}

	} else if (fetchRs.status === 200) { // normal, still running
		const tab = await browser.tabs.create({url})
		if (!tab.id) {
			throw new Error(LOG_PREFIX + 'tab id is undefined.')
		}
		console.log(LOG_PREFIX, 'house status is normal ')

		await handleNormalPage(tab.id, task)
	}
}

async function updateTaskMiss(task: HouseTask) {
	//构建task对象(否则成员函数不生效)
	const taskObj = HouseTask.fromHouseTask(task)
	//标记当前任务今天的crawl记录
	taskObj.markAccess()

	let sameAt = Date.now();
	await db.houseTasks.update(task.id, {
		status: HouseTaskStatus.miss,
		lastRunningAt: sameAt,
		accessRecord: taskObj.accessRecord
	})

	//如果之前状态不是 miss,则新增 houseStatusChanges
	if(task.status!==HouseTaskStatus.miss){
		await db.houseStatusChanges.add({
			at: sameAt,
			cid: task.cid,
			hid: task.hid,
			oldValue: task.status,
			newValue: HouseTaskStatus.miss
		})
	}
}

async function handleSoldPage(pageId: number,taskInDb:HouseTask) {

	//发送message ,让页面进行parse item
	const respParsedItem = await sendMessage('parseHouseSold', {}, 'content-script@' + pageId)
	console.log('[house-control]receive parseHouseSold result:', respParsedItem)


	//构建task对象(否则成员函数不生效)
	const houseTaskObj = HouseTask.fromHouseTask(taskInDb)
	//标记当前任务今天的crawl记录
	houseTaskObj.markAccess()
	const sameAt=Date.now()


	//update price status
	await db.houseTasks.update(houseTaskObj.id, {
		totalPrice: respParsedItem.price,
		status: HouseTaskStatus.sold,
		soldDate: respParsedItem.soldDate,
		lastRunningAt: sameAt,
		accessRecord: houseTaskObj.accessRecord
	})

	//如果price发生变动, 增加houseChanges记录
	if (respParsedItem.price && houseTaskObj?.totalPrice !== respParsedItem.price) {
		await db.houseChanges.add({
			hid: taskInDb.hid,
			cid: taskInDb.cid,
			at: sameAt,
			oldValue: houseTaskObj.totalPrice ?? -1,
			newValue: respParsedItem.price,
		})
	}

	//如果之前状态不是 sold,则新增 houseStatusChanges
	if(taskInDb.status!==HouseTaskStatus.sold){
		await db.houseStatusChanges.add({
			at: sameAt,
			cid: houseTaskObj.cid,
			hid: houseTaskObj.hid,
			oldValue: taskInDb.status,
			newValue: HouseTaskStatus.sold
		})
	}
	console.log('[house-control] update sold house task done.')
}


/**
 * 开启一次爬取, 向content发送message, 根据页面抓取结果更新任务自身,以及新建changes
 * @param pageTabId
 * @param taskInDb
 */
export async function handleNormalPage(pageTabId: number, taskInDb: HouseTask) {
	//发送message ,让页面进行parse item
	const respParsedItem = await sendMessage('parseHouse', {}, 'content-script@' + pageTabId)
	console.log('receive parseHouse result:', respParsedItem)

	//构建task对象(否则成员函数不生效)
	const houseTaskObj = HouseTask.fromHouseTask(taskInDb)
	//标记当前任务今天的crawl记录
	houseTaskObj.markAccess()


	/**
	 * 本函数内 所有更新行为发生的时刻
	 */
	let sameAt = Date.now();


	//更新task, 如果有字段更新, 构建更新对象
	const {dexieUpdateChanges, commonFieldChanges} = genTaskUpdateChanges(houseTaskObj, respParsedItem)
	console.log('dexieUpdateChanges', dexieUpdateChanges)
	await db.houseTasks.update(houseTaskObj.id, {
		...dexieUpdateChanges,
		lastRunningAt: sameAt,
		accessRecord: houseTaskObj.accessRecord
	})


	//如果price发生变动, 增加houseChanges记录
	if (respParsedItem.totalPrice && houseTaskObj?.totalPrice !== respParsedItem.totalPrice) {
		await db.houseChanges.add({
			hid: respParsedItem.hid,
			cid: respParsedItem.cid,
			at: sameAt,
			oldValue: houseTaskObj.totalPrice ?? -1,
			newValue: respParsedItem.totalPrice,
		})
	}

	//如果有非价格的信息字段的更新, 则也记录
	if (commonFieldChanges.length > 0) {
		await db.houseCommonFieldChanges.bulkAdd(commonFieldChanges.map(c => ({
			at: sameAt, cid: houseTaskObj.cid, hid: houseTaskObj.hid, name: c.name, newValue: c.newValue, oldValue: c.oldValue
		})))
	}

	//如果之前状态不是normal,则新增 houseStatusChanges
	if(taskInDb.status!==HouseTaskStatus.running){
		await db.houseStatusChanges.add({
			at: sameAt,
			cid: houseTaskObj.cid,
			hid: houseTaskObj.hid,
			oldValue: taskInDb.status,
			newValue: HouseTaskStatus.running
		})
	}

	return {houseTask: houseTaskObj, respParsedItem}
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
	const fieldsExcludeInCommonChange: (keyof HouseItem)[] = [
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
			if (oldValue !== undefined && oldValue != null && !fieldsExcludeInCommonChange.includes(field)) {
				commonFieldChanges.push({name: field, newValue, oldValue}); // 添加到变更记录
			}
		}
	});

	return {dexieUpdateChanges, commonFieldChanges};
}