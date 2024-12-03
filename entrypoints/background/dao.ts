import {onMessage} from "webext-bridge/background"
import {db} from "@/utils/client/Dexie";
import {HouseNormal} from "@/types/LjUpdatePreview";
import {HouseTask, HouseTaskStatus} from "@/types/lj";
import {updateOneNormal} from "@/entrypoints/reuse/house-update";
import {sendMessage} from "webext-bridge/popup";

export function registerDaoMessage(){
	onMessage('queryCommunityTask', async (msg)=>{
		const cid=msg.data.cid
		const queryResult=await db.communityTasks.where('cid').equals(cid).toArray()

		return queryResult
	})
	console.log('[registerDaoMessage]','queryCommunityTask')


	onMessage('addCommunityTask', async (msg)=>{
		const task=msg.data
		const queryResult=await db.communityTasks.add(task)

		return {
			resp:queryResult+''
		}
	})
	console.log('[registerDaoMessage]','addCommunityTask')

	onMessage('queryHouseTask', async (msg)=>{
		const hid=msg.data.hid
		return db.houseTasks.where('hid').equals(hid).toArray();
	})
	console.log('[registerDaoMessage]','queryHouseTask')


	onMessage('updateHouse', async (msg)=>{
		console.log('[dao:updateHouse]',msg.data)

		const {houseNormal,taskInDb}=msg.data as {houseNormal:HouseNormal, taskInDb:HouseTask}
		let at = Date.now();
		return await updateOneNormal(houseNormal,taskInDb,at)
	})
	console.log('[registerDaoMessage]','updateHouse')


	onMessage('createHouseTask', async (msg)=>{
		console.log('[dao:createHouseTask]',msg.data)
		try{
			const houseItem=msg.data
			const count=await db.houseTasks.where('hid').equals(houseItem.hid).count()

			if(count>0){
				return {reason:'已存在'}
			}else{
				let houseTask = HouseTask.newFromItem(houseItem);
				houseTask.markAccess()
				//add task
				const task=await db.houseTasks.add(houseTask)
				//add status change
				await db.houseStatusChanges.add({
					hid: houseTask.hid,
					cid: houseTask.cid,
					at: houseItem.createdAt,
					oldValue: HouseTaskStatus.void,
					newValue: HouseTaskStatus.running,
				})
				return {}
			}
		}catch (e){
			console.error('[dao:createHouseTask] error happens.',e)
			return {reason:"失败"+ (e as Error)?.message}
		}

	})
}
export async function isHouseTaskExist(hid:string){
	return await db.houseTasks.where('hid').equals(hid).count()>0
}