import Dexie, {EntityTable} from "dexie";
import {DebugInfo, type DexieSampleItem} from "@/types/sample-models";
import {CommonFieldChange, CommunityRecord, CommunityTask, HouseChange, HouseStatusChange, HouseTask} from "@/types/lj";
import {CommunityUpdatePreview, HousesUpdatePreview} from "@/types/LjUpdatePreview";
import {TaskGroup} from "@/types/group";

const db = new Dexie('ext-Default') as Dexie & {
	items: EntityTable<
		DexieSampleItem,
		'id' // primary key "id" (for the typings only)
	>;
	debugInfo:EntityTable<DebugInfo,'id'>,
	houseChanges: EntityTable<HouseChange,'id'>,
	houseCommonFieldChanges: EntityTable<CommonFieldChange,'id'>, //信息字段(非价格字段)的变更记录
	houseStatusChanges: EntityTable<HouseStatusChange,'id'>,
	houseTasks: EntityTable<HouseTask,'id'>,
	communityTasks: EntityTable<CommunityTask, 'id'>,
	communityRecords: EntityTable<CommunityRecord,'id'>

	communityTaskGroups: EntityTable<TaskGroup,'id'>
	houseTaskGroups: EntityTable<TaskGroup,'id'>

	tempBatchHouse: EntityTable<{id?:number,hidList:string[]},'id'> //batch house时, 通过此表options页面向sidebar页面传递hidList
	tempBatchCommunity: EntityTable<{id?:number,communityList:CommunityTask[]},'id'>

	tempHouseUpdatePreview: EntityTable<HousesUpdatePreview,'batchId'>
	tempCommunityUpdatePreview: EntityTable<CommunityUpdatePreview,'batchId'>

};

db.version(102).stores({
	items: '++id, name, price, createdAt', // Auto-increment id, and indexes for queries
	debugInfo:'++id',
	houseChanges: '++id,  hid, cid, at,newValue',
	houseCommonFieldChanges: '++id, hid, cid, at, name',
	houseTasks: '++id, &hid, cid, city, status, createdAt,totalPrice,unitPrice, lastRunningAt,autoRecord',
	houseStatusChanges: '++id, hid, cid, at, newValue,oldValue',
	communityTasks: '++id, &cid, city, status,name, createdAt, lastRunningAt',
	communityTaskGroups: '++id, name, createdAt',
	houseTaskGroups: '++id, name, createdAt',
	communityRecords: '++id, cid, city, at',
	tempBatchHouse: '++id',
	tempBatchCommunity: "++id",
	tempHouseUpdatePreview: 'batchId',
	tempCommunityUpdatePreview: 'batchId'

});

export {
	db
}