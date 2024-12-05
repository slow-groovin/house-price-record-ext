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
