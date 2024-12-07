import {HouseTaskStatus} from "@/types/lj";

export type HouseTaskQueryCondition={
	hidInclude?:string,
	cidInclude?:string,
	status?:HouseTaskStatus,
	city?:string,
	createdAtMin?:string,
	createdAtMax?:string,
	totalPriceMin?:number,
	totalPriceMax?:number,
	addedType?: number,

}
// 定义排序状态类型
export interface SortState<T> {
	field?: keyof T
	order?: 'asc' | 'desc'
}


export type HouseChangeQueryCondition={
	hidInclude?:string,
	cidInclude?:string,
	atMin?:string,
	atMax?:string,
	newValueMin?:number,
	newValueMax?:number,
	oldValueMin?:number,
	oldValueMax?:number,
	type?:'increase'|'decrease',
}

export type HouseStatusChangeQueryCondition={
	hidInclude?:string,
	cidInclude?:string,
	atMin?:string,
	atMax?:string,
	newValue?:HouseTaskStatus,
	oldValue?:HouseTaskStatus,
}

export type CommunityQueryCondition={
	cidInclude?:string,
	nameInclude?:string,

	lastRunningAtMin?:string,
	lastRunningAtMax?:string,
	createdAtMin?:string,
	createdAtMax?:string,
	city?:string,
	avgTotalPriceMin?:number,
	avgTotalPriceMax?:number,
	avgUnitPriceMin?:number,
	avgUnitPriceMax?:number,
	onSellCountMin?:number,
	onSellCountMax?:number,
}