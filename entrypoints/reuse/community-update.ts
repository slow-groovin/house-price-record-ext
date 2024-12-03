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


export async function updateBatchCommunityWithPreview(preview?:CommunityUpdatePreview){
	if(!preview){
		alert("没有数据!")
		return
	}

	for (let record of preview.records) {
		record.at=preview.at
		await updateOneCommunityWithRecord(record)

	}
}

async function updateOneCommunityWithRecord(record:CommunityRecord){
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
	record.houseList = record.houseList.map(({price, hid}) => ({hid, price}))
	const insertId = await db.communityRecords.add(record)
	console.log('[execManualRunCrawlOne]record insertId:', insertId)

	/**
	 * 更新task: 字段  lastRunningAt
	 */
	let task = await db.communityTasks.where('cid').equals(record.cid).first()
	if (!task)
		throw new Error('task should exist! :'+record.cid)

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
			houseTask.addedType=TaskAddedType.autoByCommunity
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
 * 为record中的removeItem中的所有item更新
 * 不能更新! 因为不确定是miss还是sold,需要在页面内标记后提示手动更新
 * @param record
 */
async function updateRemovedHouseTask(record: CommunityRecord) {

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