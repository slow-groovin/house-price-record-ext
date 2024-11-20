import {Maybe} from "@/types/generic";
import {AccessRecord} from "@/utils/lib/AcessRecord";

/**
 * house所有信息的结构, 不存入数据库, 仅在程序内存中使用
 */
export interface HouseItem {
	hid: string,
	cid: string,
	city: string,
	totalPrice?: number,
	unitPrice?: number,
	area?: number,
	name?: string,
	buildingType?: string,
	yearBuilt?: string,
	roomType?: string,
	roomSubType?: string,
	orientation?: string;
}


export interface HouseChange{
	id:number,
	hid:string,
	cid:string,

	oldValue: number,
	newValue:number
	at: number,
}

export enum HouseTaskStatus {
	running = 1,
	pause = 2,
	miss = 3, out = 4
}

export enum TaskAddedType{manual=1, scan=2}

export class HouseTask implements HouseItem{
	public lastRunningAt: number;
	public name?:string;
	public id?: number;
	public totalPrice?:number;
	public unitPrice?:number;
	public area?:number;
	public realArea?:number;
	public realUnitPrice?:number;

	public buildingType?: string;
	public yearBuilt?: string;
	public roomType?: string;
	public roomSubType?: string;
	public orientation?: string;

	constructor(
		public hid: string,
		public cid: string,
		public city: string,
		public state: HouseTaskStatus = HouseTaskStatus.running,
		public accessRecord=new AccessRecord(),
		public createdAt: number = Date.now(),
		public autoRecord: boolean = false,
		public addedType: TaskAddedType = TaskAddedType.manual,
	) {
		this.lastRunningAt = this.createdAt
		console.log('init', hid)
	}

	static newFromItem(item:HouseItem){
		const task=new HouseTask(item.hid, item.cid, item.city)

		task.totalPrice=item.totalPrice
		task.unitPrice=item.unitPrice
		task.area=item.area
		task.name=item.name
		task.buildingType=item.buildingType
		task.yearBuilt=item.yearBuilt
		task.roomType=item.roomType
		task.roomSubType=item.roomSubType
		task.orientation=item.orientation

		return task;
	}
	static fromHouseTask(variable:HouseTask){
		const task= Object.assign(new HouseTask('','',''),variable)
		task.accessRecord=Object.assign(new AccessRecord(),variable.accessRecord)
		return task
	}

	/**
	 * 记录今天的访问
	 */
	public markAccess(){
		this.accessRecord.setAccessStatus(new Date(),true)
	}
}