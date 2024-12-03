import {ProtocolWithReturn} from "webext-bridge";
import {CommunityListPageItem, CommunityTask, HouseItem, HouseTask} from "@/types/lj";
import {HouseNormal} from "@/types/LjUpdatePreview";

declare module "webext-bridge" {
	export interface ProtocolMap {
		block: ProtocolWithReturn<{enable:boolean}, {resp:string}>,
		houseItem: ProtocolWithReturn<HouseItem,{resp:string}>,
		parseHouse: ProtocolWithReturn<{},HouseItem>,
		parseHouseSold: ProtocolWithReturn<{},{price:number,soldDate?:string}>,
		simple: ProtocolWithReturn<string,any>
		debug: ProtocolWithReturn<string,any>
		// to specify the return type of the message,
		// use the `ProtocolWithReturn` type wrapper
		bar: ProtocolWithReturn<{}, {}>;

		openOptionPage: ProtocolWithReturn<string, any>

		/**
		 *  contentUI -> background to manual run one task
		 */
		crawlCommunityTask: ProtocolWithReturn<{cid:string}, {resp:string}>;

		/**
		 *  * -> background.js
		 *  校验house是否下架/售出, 如果还存在则爬取并更新task和记录change
		 */
		crawlHouseTask: ProtocolWithReturn<{hid:string}, {resp:string}>;

		/**
		 * background/side panel  -> content to parse
		 */
		parseOneCommunityListOnePage: ProtocolWithReturn<{}, CommunityListPageItem>;
		/**
		 * DAO
		 */
		addCommunityTask: ProtocolWithReturn<CommunityTask, {resp:string}>;
		queryCommunityTask: ProtocolWithReturn<{cid:string}, CommunityTask[]>;
		queryHouseTask: ProtocolWithReturn<{hid:string}, HouseTask[]>;
		updateHouse: ProtocolWithReturn<UpdateHouseParam, any>;
		createHouseTask: ProtocolWithReturn<HouseItem, {reason?:string}>;
	}

	export type UpdateHouseParam={houseNormal:HouseNormal, taskInDb:HouseTask}
}


