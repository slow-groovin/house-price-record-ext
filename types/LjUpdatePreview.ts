import {HouseTaskStatus} from "@/types/lj";


interface HousesUpdatePreview {
	batchId: string,
	at: number,
	normal: HouseNormal[],
	miss: HouseUpdateBase[],
	sold: HouseSold[],
}

type HouseUpdateBase = {
	type: 'normal' | 'miss' | 'sold'
	hid: string,
	// at: number,
}

interface HouseSold extends HouseUpdateBase {
	soldDate: string,
	newPrice?: number, //如果不为空, 则价格发生了变动, 需要更新
}

interface HouseNormal extends HouseUpdateBase {
	updateChanges?: Record<string, any>,
	commonFieldChanges?: { name: string, newValue: any, oldValue: any }[],
	newPrice?: number,  //如果不为空, 则价格发生了变动, 需要更新
	newStatus?: HouseTaskStatus,
}

export type {
	HousesUpdatePreview,
	HouseUpdateBase,
	HouseNormal,
	HouseSold,
}