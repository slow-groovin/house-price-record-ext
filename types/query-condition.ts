import {HouseTaskStatus} from "@/types/lj";

export type HouseTaskQueryCondition={
	groupId?:number,

	hidInclude?:string,
	cidInclude?:string,
	cidEqual?:string,

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
	groupId?:number,
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

export const houseQueryConditionTemplate:HouseTaskQueryCondition={
	groupId: 0,

	addedType: 0,
	cidEqual: "",
	cidInclude: "",
	city: "",
	createdAtMax: "",
	createdAtMin: "",
	hidInclude: "",
	status: HouseTaskStatus.void,
	totalPriceMax: 0,
	totalPriceMin: 0
}
export const communityQueryConditionTemplate:CommunityQueryCondition={
	groupId: 0,

	avgTotalPriceMax: 0,
	avgTotalPriceMin: 0,
	avgUnitPriceMax: 0,
	avgUnitPriceMin: 0,
	cidInclude: "",
	city: "",
	createdAtMax: "",
	createdAtMin: "",
	lastRunningAtMax: "",
	lastRunningAtMin: "",
	nameInclude: "",
	onSellCountMax: 0,
	onSellCountMin: 0
}