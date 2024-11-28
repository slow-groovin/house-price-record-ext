import Dexie, {EntityTable} from "dexie";
import {DebugInfo, type DexieSampleItem} from "@/types/sample-models";
import {CommonFieldChange, CommunityRecord, CommunityTask, HouseChange, HouseStatusChange, HouseTask} from "@/types/lj";

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

};
db.version(2).stores({
	items: '++id, name, price, createdAt', // Auto-increment id, and indexes for queries
	debugInfo:'++id',
	houseChanges: '++id, price, hid, cid, at',
	houseCommonFieldChanges: '++id, hid, cid, at, name',
	houseTasks: '++id, hid, cid, city, status, createdAt, lastRunningAt,autoRecord',
	houseStatusChanges: '++id, hid, cid, at',
	communityTasks: '++id, cid, city, status, createdAt, lastRunningAt',
	communityRecords: '++id, cid, city, at',

});

export {
	db
}