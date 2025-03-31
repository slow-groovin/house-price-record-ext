import {db} from "@/utils/client/Dexie";
import {genHousePageUrl} from "@/utils/lj-url";

export function goSidePanelHome(){
	window.location.href='/sidepanel.html'
}

export async function openUrlForHid(hid:string){
	const task=await db.houseTasks.where('hid').equals(hid).first()
	if(!task?.city){
		return
	}
	const url= genHousePageUrl(task.city, hid)
	window.open(url,'_target')
}