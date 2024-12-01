import {db} from "@/utils/client/Dexie";
import {HousesUpdatePreview} from "@/types/LjUpdatePreview";
import {HouseTaskStatus} from "@/types/lj";
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
		const accessRecord=AccessRecord.fromAccessRecord(task.accessRecord)
		accessRecord.setAccessStatus(new Date(at),true)
		await db.houseTasks.update(task.id,{
			status: HouseTaskStatus.miss,
			lastRunningAt: at,
			accessRecord: accessRecord,
		})
		//如果之前状态不是 miss,则新增 houseStatusChanges
		if(task.status!==HouseTaskStatus.miss){
			await db.houseStatusChanges.add({
				at: at,
				cid: task.cid,
				hid: task.hid,
				oldValue: task.status,
				newValue: HouseTaskStatus.miss
			})
		}
	}

	for (let item of sold) {
		const task=await db.houseTasks.where('hid').equals(item.hid).first()
		if(!task){
			console.warn("miss house task not found",item)
			continue
		}
		const accessRecord=AccessRecord.fromAccessRecord(task.accessRecord)
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
				hid: task.hid,
				cid: task.cid,
				at: at,
				oldValue: task.totalPrice ?? -1,
				newValue: item.newPrice,
			})
		}
		await db.houseTasks.update(task.id,changes)
		//如果之前状态不是 sold,则新增 houseStatusChanges
		if(task.status!==HouseTaskStatus.sold){
			await db.houseStatusChanges.add({
				at: at,
				cid: task.cid,
				hid: task.hid,
				oldValue: task.status,
				newValue: HouseTaskStatus.sold
			})
		}
	}

	for (let item of normal) {
		const task=await db.houseTasks.where('hid').equals(item.hid).first()
		if(!task){
			console.warn("miss house task not found",item)
			continue
		}
		const accessRecord=AccessRecord.fromAccessRecord(task.accessRecord)
		accessRecord.setAccessStatus(new Date(at),true)

		const {updateChanges,commonFieldChanges,newPrice,newStatus}=item
		let changes = {
			...updateChanges,
			lastRunningAt: at,
			accessRecord: accessRecord,
		};
		await db.houseTasks.update(task.id,changes)
		if(newPrice){
			await db.houseChanges.add({
				hid: task.hid,
				cid: task.cid,
				at: at,
				oldValue: task.totalPrice ?? -1,
				newValue: newPrice,
			})
		}
		if(newStatus){
			await db.houseStatusChanges.add({
				at: at,
				cid: task.cid,
				hid: task.hid,
				oldValue: task.status,
				newValue: newStatus
			})
		}
		if(commonFieldChanges && commonFieldChanges.length>0){
			await db.houseCommonFieldChanges.bulkAdd(commonFieldChanges.map(c=>({
				at: at,
				cid: task.cid,
				hid: task.hid,
				name: c.name,
				newValue: c.newValue,
				oldValue: c.oldValue

			})))
		}

		await db.tempHouseUpdatePreview.delete(preview.batchId)
	}
}