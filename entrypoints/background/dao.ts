import {onMessage} from "webext-bridge/background"
import {db} from "@/utils/client/Dexie";

export function registerDaoMessage(){
	console.log('registerDaoMessage')
	onMessage('queryCommunityTask', async (msg)=>{
		const cid=msg.data.cid
		const queryResult=await db.communityTasks.where('cid').equals(cid).toArray()

		return queryResult
	})

	onMessage('addCommunityTask', async (msg)=>{
		const task=msg.data
		const queryResult=await db.communityTasks.add(task)

		return {
			resp:queryResult+''
		}
	})
}
export async function isHouseTaskExist(hid:string){
	return await db.houseTasks.where('hid').equals(hid).count()>0
}