import {db} from "@/utils/client/Dexie";
import {HouseNormal, HouseSold, HousesUpdatePreview, HouseUpdateBase} from "@/types/LjUpdatePreview";
import {HouseTask, HouseTaskStatus} from "@/types/lj";
import {AccessRecord} from "@/utils/lib/AcessRecord";




export async function updateBatchHouseWithPreview(preview?:HousesUpdatePreview){
	if(!preview){
		alert("没有数据!")
		return
	}

	const {batchId,miss,normal,sold,at}=preview
	for (let item of miss) {
		const task=await db.houseTasks.where('hid').equals(item.hid).first()
		if(!task){
			console.warn("miss house task not found",item)
			continue
		}
		await updateOneMiss(item,task,at)
	}

	for (let item of sold) {
		const task=await db.houseTasks.where('hid').equals(item.hid).first()
		if(!task){
			console.warn("miss house task not found",item)
			continue
		}
		await updateOneSold(item,task,at)
	}

	for (let item of normal) {
		const task=await db.houseTasks.where('hid').equals(item.hid).first()
		if(!task){
			console.warn("miss house task not found",item)
			continue
		}
		await updateOneNormal(item,task, at)
	}

	await db.tempHouseUpdatePreview.delete(batchId)
}


/**
 * 更新一项 house normal, 根据preview和taskInDb进行更新
 */
export async function updateOneNormal(houseNormal:HouseNormal, taskInDb: HouseTask, at:number){
	const accessRecord=AccessRecord.fromAccessRecord(taskInDb.accessRecord)
	accessRecord.setAccessStatus(new Date(at),true)

	const {updateChanges,commonFieldChanges,newPrice,newStatus}=houseNormal
	let changes = {
		...updateChanges,
		lastRunningAt: at,
		accessRecord: accessRecord,
	};
	//更新task自身
	await db.houseTasks.update(taskInDb.id,changes)
	//如果有价格变动, 新增changes
	if(newPrice){
		await db.houseChanges.add({
			hid: taskInDb.hid,
			cid: taskInDb.cid,
			at: at,
			oldValue: taskInDb.totalPrice ?? -1,
			newValue: newPrice,
		})
	}
	//如果有状态变动, 新增statusChanges
	if(newStatus){
		await db.houseStatusChanges.add({
			at: at,
			cid: taskInDb.cid,
			hid: taskInDb.hid,
			oldValue: taskInDb.status,
			newValue: newStatus
		})
	}
	//如果有描述字段变动, 新增变动
	if(commonFieldChanges && commonFieldChanges.length>0){
		await db.houseCommonFieldChanges.bulkAdd(commonFieldChanges.map(c=>({
			at: at,
			cid: taskInDb.cid,
			hid: taskInDb.hid,
			name: c.name,
			newValue: c.newValue,
			oldValue: c.oldValue

		})))
	}
}


export async function updateOneMiss(item:HouseUpdateBase, taskInDb: HouseTask, at:number) {
	const task=await db.houseTasks.where('hid').equals(item.hid).first()
	if(!task){
		console.warn("miss house task not found",item)
		return
	}
	const accessRecord=AccessRecord.fromAccessRecord(taskInDb.accessRecord)
	accessRecord.setAccessStatus(new Date(at),true)
	await db.houseTasks.update(taskInDb.id,{
		status: HouseTaskStatus.miss,
		lastRunningAt: at,
		accessRecord: accessRecord,
	})
	//如果之前状态不是 miss,则新增 houseStatusChanges
	if(taskInDb.status!==HouseTaskStatus.miss){
		await db.houseStatusChanges.add({
			at: at,
			cid: taskInDb.cid,
			hid: taskInDb.hid,
			oldValue: taskInDb.status,
			newValue: HouseTaskStatus.miss
		})
	}
}

export async function updateOneSold(item:HouseSold, taskInDb: HouseTask, at:number) {
	const accessRecord=AccessRecord.fromAccessRecord(taskInDb.accessRecord)
	accessRecord.setAccessStatus(new Date(at),true)

	let changes:any = {
		status: HouseTaskStatus.sold,
		lastRunningAt: at,
		soldDate: item.soldDate,
		accessRecord: accessRecord,
	};
	if(item.newPrice){
		changes['totalPrice']=item.newPrice
		await db.houseChanges.add({
			hid: taskInDb.hid,
			cid: taskInDb.cid,
			at: at,
			oldValue: taskInDb.totalPrice ?? -1,
			newValue: item.newPrice,
		})
	}
	await db.houseTasks.update(taskInDb.id,changes)
	//如果之前状态不是 sold,则新增 houseStatusChanges
	if(taskInDb.status!==HouseTaskStatus.sold){
		await db.houseStatusChanges.add({
			at: at,
			cid: taskInDb.cid,
			hid: taskInDb.hid,
			oldValue: taskInDb.status,
			newValue: HouseTaskStatus.sold
		})
	}
}
