import Dexie, {EntityTable} from "dexie";
import {DebugInfo, type DexieSampleItem} from "@/types/sample-models";
import {HouseItem, HouseChange, HouseTask, CommunityTask} from "@/types/lj";

const db = new Dexie('Database-Dexie-Sample') as Dexie & {
	items: EntityTable<
		DexieSampleItem,
		'id' // primary key "id" (for the typings only)
	>;
	debugInfo:EntityTable<DebugInfo,'id'>,
	houseChanges: EntityTable<HouseChange,'id'>,
	houseTasks: EntityTable<HouseTask,'id'>,
	communityTasks: EntityTable<CommunityTask, 'id'>,

};
db.version(2).stores({
	items: '++id, name, price, createdAt', // Auto-increment id, and indexes for queries
	debugInfo:'++id',
	houseChanges: '++id, price, hid, cid, at',
	houseTasks: '++id, hid, cid, city, status, createdAt, lastRunningAt,autoRecord',
	communityTasks: '++id, cid, city, status, createdAt, lastRunningAt'
});

export {
	db
}