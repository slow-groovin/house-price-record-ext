import { defineExtensionMessaging } from '@webext-core/messaging';
import {CommunityListPageItem, CommunityTask, HouseItem, HouseTask} from "@/types/lj";
import {HouseNormal} from "@/types/LjUpdatePreview";

interface ProtocolMap {
	houseItem(houseItem:HouseItem): Promise<{resp:string}>;
	parseHouse(): Promise<HouseItem>;
	parseHouseSold(): Promise<{price:number,soldDate?:string}>;

	simple(msg:string): Promise<any>;
	debug(msg:string): Promise<any>;

	bar(): Promise<{}>;
	openOptionPage(url:string): Promise<any>;
	getStorageLocal(key:string): Promise<any>;



	crawlCommunityTask(data:{cid:string}): Promise<{resp:string}>;
	crawlHouseTask(data:{hid:string}): Promise<{resp:string}>;

	parseOneCommunityListOnePage(): Promise<CommunityListPageItem>;

	addCommunityTask(task:CommunityTask): Promise<{resp:string}>;
	queryCommunityTask(data:{cid:string}): Promise<CommunityTask[]>;


	queryHouseTask(data:{hid:string}): Promise<HouseTask[]>;
	updateHouse(param:UpdateHouseParam): Promise<any>;
	createHouseTask(houseItem:HouseItem): Promise<{ reason?: string }>;



}

export type UpdateHouseParam={houseNormal:HouseNormal, taskInDb:HouseTask}
export const { sendMessage, onMessage } = defineExtensionMessaging<ProtocolMap>();
