import Dexie, {EntityTable} from "dexie";
import {DebugInfo, type DexieSampleItem} from "@/types/sample-models";
import {CommonFieldChange, CommunityRecord, CommunityTask, HouseChange, HouseStatusChange, HouseTask} from "@/types/lj";
import {CommunityUpdatePreview, HousesUpdatePreview} from "@/types/LjUpdatePreview";

const db = new Dexie('Database-Dexie-Sample') as Dexie & {
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

	tempBatchHouse: EntityTable<{id?:number,hidList:string[]},'id'> //batch house时, 通过此表options页面向sidebar页面传递hidList
	tempBatchCommunity: EntityTable<{id?:number,communityList:CommunityTask[]},'id'>

	tempHouseUpdatePreview: EntityTable<HousesUpdatePreview,'batchId'>
	tempCommunityUpdatePreview: EntityTable<CommunityUpdatePreview,'batchId'>

};

db.version(101).stores({
	items: '++id, name, price, createdAt', // Auto-increment id, and indexes for queries
	debugInfo:'++id',
	houseChanges: '++id, price, hid, cid, at',
	houseCommonFieldChanges: '++id, hid, cid, at, name',
	houseTasks: '++id, &hid, cid, city, status, createdAt, lastRunningAt,autoRecord',
	houseStatusChanges: '++id, hid, cid, at',
	communityTasks: '++id, &cid, city, status, createdAt, lastRunningAt',
	communityRecords: '++id, cid, city, at',
	tempBatchHouse: '++id',
	tempBatchCommunity: "++id",
	tempHouseUpdatePreview: 'batchId',
	tempCommunityUpdatePreview: 'batchId'

});

export {
	db
}