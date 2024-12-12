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
 * 更新数据, 自动合并本周记录(对比上一周最后一条记录,删除本周的记录)
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

async function updateOneCommunityWithRecord(record: CommunityRecord) {

	await autoUpdateOrCreateHouseTask(record)

	//本周的开始时刻
	const weekStartAt = startOfWeek(new Date(), {weekStartsOn: 1}).getTime()
	//查询本周之前的第一个record
	const lastRecordBeforeThisWeek = await db.communityRecords.where('cid').equals(record.cid)
		.and(r => r.at < weekStartAt).last()
	console.log(lastRecordBeforeThisWeek?.id, record.cid)

	//查询本周的record并删除
	await db.communityRecords.where('cid').equals(record.cid).and(r => r.at >= weekStartAt).delete()

	const lastRecord = lastRecordBeforeThisWeek

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

		await updateRemoveItems(record)
	}


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

}


/**
 * 为record中的houseList中的所有item自动创建任务或更新
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
			//如果status发生变动,
			if (task?.status !== HouseTaskStatus.running) {
				await db.houseStatusChanges.add({
					hid: item.hid,
					cid: record.cid,
					at: record.at,
					oldValue: task.status,
					newValue: HouseTaskStatus.running,
				})
				task.status = HouseTaskStatus.running
			}
			const taskObj = HouseTask.fromHouseTask(task)

			taskObj.markAccess()

			await db.houseTasks.where('id').equals(task!.id as number).modify(taskObj)


		} else {
			//create task
			if (!record.city) {
				console.error('record has no city!', record.city)
				return
			}

			let houseTask = HouseTask.newFromItem({...item, city: record.city, cid: record.cid});
			houseTask.markAccess()
			houseTask.addedType = TaskAddedType.autoByCommunity
			await db.houseTasks.add(houseTask)

			//add status change: indicate new create
			await db.houseStatusChanges.add({
				hid: item.hid,
				cid: record.cid,
				at: record.at,
				oldValue: HouseTaskStatus.void,
				newValue: HouseTaskStatus.running,
			})

		}
	}
}


/**
 * 为record中的removeItem中的项更新状态
 */
async function updateRemoveItems(record: CommunityRecord) {
	if (!record.removedItem) return
	for (let item of record.removedItem) {
		const task = await db.houseTasks.where('hid').equals(item.hid).first()
		if (task && task.status === HouseTaskStatus.running) {
			//如果状态发生变动, 增加houseChanges记录
			await db.houseStatusChanges.add({
				hid: item.hid,
				cid: record.cid,
				at: record.at,
				oldValue: HouseTaskStatus.running,
				newValue: HouseTaskStatus.miss,
			})
			await db.houseTasks.update(task.id, {
				status: HouseTaskStatus.miss,
				lastRunningAt: record.at,
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