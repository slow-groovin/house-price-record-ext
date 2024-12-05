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

	onSellDate?: number

	realArea?: number;
	realUnitPrice?: number;
}


export interface HouseChange {
	id?: number,
	hid: string,
	cid: string,

	oldValue: number,
	newValue: number
	at: number,
}

export enum HouseTaskStatus {
	running = 1,
	pause = 2,
	miss = 3,
	sold = 4,
	void=-1, //尚未创建
}

export const HouseTaskStatusText = {
	[HouseTaskStatus.running]: '正常',
	[HouseTaskStatus.pause]: '暂停',
	[HouseTaskStatus.miss]: '下架',
	[HouseTaskStatus.sold]: '成交',
	[HouseTaskStatus.void]: '未创建',
} as const


export enum TaskAddedType {manual = 1, autoByCommunity = 2, forDebug = 11}

export class HouseTask implements HouseItem {
	public lastRunningAt: number;
	public name?: string;
	public id?: number;
	public totalPrice?: number;
	public unitPrice?: number;
	public area?: number;
	public realArea?: number;
	public realUnitPrice?: number;

	public buildingType?: string;
	public yearBuilt?: string;
	public roomType?: string;
	public roomSubType?: string;
	public orientation?: string;

	public onSellDate?: number;

	/**
	 * 成交时间: 字符串
	 */
	public soldDate?: string;

	constructor(
		public hid: string,
		public cid: string,
		public city: string,
		public status: HouseTaskStatus = HouseTaskStatus.running,
		public accessRecord = new AccessRecord(),
		public createdAt: number = Date.now(),
		public autoRecord: boolean = false,
		public addedType: TaskAddedType = TaskAddedType.manual,
	) {
		this.lastRunningAt = this.createdAt
		// console.log('init', hid)
	}

	static newFromItem(item: HouseItem) {
		const task = new HouseTask(item.hid, item.cid, item.city)

		task.totalPrice = item.totalPrice
		task.unitPrice = item.unitPrice
		task.area = item.area
		task.name = item.name
		task.buildingType = item.buildingType
		task.yearBuilt = item.yearBuilt
		task.roomType = item.roomType
		task.roomSubType = item.roomSubType
		task.orientation = item.orientation

		return task;
	}

	static fromHouseTask(variable: HouseTask) {
		const task = Object.assign(new HouseTask('', '', ''), variable)
		task.accessRecord = Object.assign(new AccessRecord(), variable.accessRecord)

		return task
	}

	/**
	 * 记录今天的访问
	 */
	public markAccess() {
		this.accessRecord.setAccessStatus(new Date(), true)
	}
}

export type CommunityBasic = {
	cid: string,
	name?: string;

	city?: string,

	avgTotalPrice?:number;

	avgUnitPrice?: number;
	onSellCount?: number;
	visitCountIn90Days?: number;
	doneCountIn90Days?: number;

}

export interface HousePriceItem {
	hid: string,
	price: number
}

export interface HousePriceChangeItem extends HousePriceItem {
	oldPrice: number
}

/**
 * 列表项中的item, 但是包含详细的信息作为字段
 */
export interface HouseListDetailItem extends HousePriceItem {
	name?: string;
	area?: number;
	buildingType?: string;
	yearBuilt?: string;
	roomType?: string;
	roomSubType?: string;
	orientation?: string;
}


export interface CommunityList {
	pageNo: number,
	maxPageNo: number,
	houseList: HouseListDetailItem[]
}

export type CommunityListPageItem = CommunityBasic & CommunityList

export enum CommunityTaskStatus { running = 1, pause = 2}

export type CommunityTask = {
	id?: number,

	status: CommunityTaskStatus,
	accessRecord: AccessRecord,
	createdAt: number;
	lastRunningAt: number;

	runningCount: number; //
} & CommunityBasic

/**
 * 所有page页面结果组成的一个record
 */
export type CommunityRecord = CommunityListPageItem & {
	id?: number,
	at: number,

	avgTotalPrice?: number;
	calcOnSellCount?: number;



	removedItem?: HousePriceItem[];
	addedItem?: HousePriceItem[];
	priceUpList?: HousePriceChangeItem[];
	priceDownList?: HousePriceChangeItem[];
}


export const CommunityModelUtil = {
	newCommunityTaskFromItem(item: CommunityBasic): CommunityTask {
		return {
			cid: item.cid,
			name: item.name,
			city: item.city,
			status: CommunityTaskStatus.running,
			accessRecord: new AccessRecord(),

			avgUnitPrice: item.avgUnitPrice,
			onSellCount: item.onSellCount,
			visitCountIn90Days: item.visitCountIn90Days,
			doneCountIn90Days: item.doneCountIn90Days,

			createdAt: Date.now(),
			lastRunningAt: Date.now(),
			runningCount: 0,
		}
	}
} as const

export interface CommonFieldChange {
	id?: number,
	hid: string,
	cid: string,
	name: string,
	newValue: any,
	oldValue: any,
	at: number
}

export interface HouseStatusChange{
	id?:number,
	hid:string;
	cid:string;
	oldValue:HouseTaskStatus,
	newValue:HouseTaskStatus,
	at: number
}

