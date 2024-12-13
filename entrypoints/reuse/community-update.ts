import {db} from "@/utils/client/Dexie";
import {CommunityUpdatePreview} from "@/types/LjUpdatePreview";
import {
	CommunityRecord,
	HousePriceChangeItem,
	HousePriceItem,
	HouseTask,
	HouseTaskStatus,
	TaskAddedType
} from "@/types/lj";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import {startOfWeek} from "date-fns";

/**
 * 批量更新community和新增record入口
 */
export async function updateBatchCommunityWithPreview(preview?: CommunityUpdatePreview) {
	if (!preview) {
		alert("没有数据!")
		return
	}

	for (let record of preview.records) {
		record.at = preview.at
		await updateOneCommunityWithRecord(record)

	}
}

/**
 * 和本周的最新一条record合并, 存入的record中表示变化的记录是相对于上周的记录
 */
async function updateOneCommunityWithRecord(record: CommunityRecord) {

	await autoUpdateOrCreateHouseTask(record)

	//本周的开始时刻
	const weekStartAt = startOfWeek(new Date(), {weekStartsOn: 1}).getTime()
	//查询本周之前的第一个record
	const lastRecordBeforeThisWeek = await db.communityRecords.where('cid').equals(record.cid)
		.and(r => r.at < weekStartAt).last()


	//查询可能存在的本周的record
	const lastRecordThisWeek=await db.communityRecords.where('cid').equals(record.cid).and(r => r.at >= weekStartAt).last()

	const lastRecord = lastRecordBeforeThisWeek




	//如果存在lastRecordBeforeThisWeek, 则计算priceUp,priceDown, added,removed,
	if (lastRecord?.houseList && lastRecord?.houseList.length > 0) {
		const {
			priceUpList,
			priceDownList,
			removedItem,
			addedItem
		} = calculateListDifferences(record.houseList, lastRecord.houseList)

		//这四个表示变更的列表赋值为与本周之前的记录对比
		record.priceUpList = priceUpList
		record.priceDownList = priceDownList
		record.removedItem = removedItem
		record.addedItem = addedItem
	}

	// 对removedItem,addedItem中的item更新状态, 如果存在lastRecordThisWeek则之更新相对于它的变更
	let removedItemForUpdate:HousePriceItem[]=record.removedItem??[]
	let addedItemForUpdate:HousePriceItem[]=record.addedItem??[]
	if(lastRecordThisWeek && lastRecordThisWeek.houseList){
		const {
			removedItem,
			addedItem
		} = calculateListDifferences(record.houseList, lastRecordThisWeek.houseList)
		removedItemForUpdate=removedItem
		addedItemForUpdate=addedItem
	}
	await updateAddedAndRemovedItems(addedItemForUpdate,removedItemForUpdate,record.cid,record.at)



	// record 入库
	record.houseList = record.houseList.map(({price, hid}) => ({hid, price}))
	const insertId = await db.communityRecords.add(record)
	console.log('[execManualRunCrawlOne]record insertId:', insertId)

	/**
	 * 更新task: 字段  lastRunningAt
	 */
	let task = await db.communityTasks.where('cid').equals(record.cid).first()
	if (!task)
		throw new Error('task should exist! :' + record.cid)

	let accessRecord = AccessRecord.fromAccessRecord(task.accessRecord);
	accessRecord.setAccessStatus(new Date(), true)

	await db.communityTasks.update(task.id, {
		lastRunningAt: record.at,
		accessRecord: accessRecord,
		avgTotalPrice: record.avgTotalPrice,

		avgUnitPrice: record.avgUnitPrice,
		doneCountIn90Days: record.doneCountIn90Days,
		visitCountIn90Days: record.visitCountIn90Days,
		onSellCount: record.onSellCount,

		runningCount: task.runningCount + 1,
	})
	//删除本周的record(相当于合并)
	if(lastRecordThisWeek)
		await db.communityRecords.delete(lastRecordThisWeek.id)

}


/**
 * 为record中的houseList中的所有item自动创建任务或更新价格
 * @param record
 */
async function autoUpdateOrCreateHouseTask(record: CommunityRecord) {
	for (let item of record.houseList) {
		const task = await db.houseTasks.where('hid').equals(item.hid).first()
		if (task) {
			//update price
			//如果price发生变动, 增加houseChanges记录
			if (item.price && task?.totalPrice !== item.price) {
				await db.houseChanges.add({
					hid: item.hid,
					cid: record.cid,
					at: record.at,
					oldValue: task.totalPrice ?? -1,
					newValue: item.price,
				})
				task.totalPrice = item.price
				if(task.area)
					task.unitPrice= Math.trunc(10000*item.price/task.area)
			}

			task.status = HouseTaskStatus.running
			const taskObj = HouseTask.fromHouseTask(task)

			taskObj.markAccess()

			await db.houseTasks.where('id').equals(task!.id as number).modify(taskObj)


		} else {
			//create task
			if (!record.city) {
				console.error('record has no city!', record.city)
				return
			}

			let houseTask = HouseTask.newFromListItem(item,record.cid,record.city);
			houseTask.markAccess()
			houseTask.addedType = TaskAddedType.autoByCommunity
			await db.houseTasks.add(houseTask)
		}
	}
}


/**
 * 为record中的removeItem中的项更新状态
 */
async function updateAddedAndRemovedItems(addedItem: HousePriceItem[],removedItem: HousePriceItem[], cid:string,at:number) {

	for (let item of removedItem) {
		const task = await db.houseTasks.where('hid').equals(item.hid).first()
		if (task && task.status === HouseTaskStatus.running) {
			//如果状态发生变动, 增加houseChanges记录
			await db.houseStatusChanges.add({
				hid: item.hid,
				cid: cid,
				at:  at,
				oldValue: HouseTaskStatus.running,
				newValue: HouseTaskStatus.miss,
			})
			await db.houseTasks.update(task.id, {
				status: HouseTaskStatus.miss,
				lastRunningAt: at,
			})
		}
	}

	for (let item of addedItem) {
		const task = await db.houseTasks.where('hid').equals(item.hid).first()
		if (task && task.status !== HouseTaskStatus.running) {
			//如果状态发生变动, 增加houseChanges记录
			await db.houseStatusChanges.add({
				hid: item.hid,
				cid: cid,
				at:  at,
				oldValue: task.status,
				newValue: HouseTaskStatus.running,
			})
			await db.houseTasks.update(task.id, {
				status: HouseTaskStatus.running,
				lastRunningAt: at,
			})
		}
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