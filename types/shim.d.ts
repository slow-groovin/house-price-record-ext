import { ProtocolWithReturn } from "webext-bridge";
import {CommunityList, CommunityListPageItem, CommunityTask, HouseItem} from "@/types/lj";
declare module "webext-bridge" {
	export interface ProtocolMap {
		block: ProtocolWithReturn<{enable:boolean}, {resp:string}>,
		houseItem: ProtocolWithReturn<HouseItem,{resp:string}>,
		parseHouse: ProtocolWithReturn<{},HouseItem>,
		simple: ProtocolWithReturn<string,any>
		debug: ProtocolWithReturn<string,any>
		// to specify the return type of the message,
		// use the `ProtocolWithReturn` type wrapper
		bar: ProtocolWithReturn<{}, {}>;


		/**
		 * Auto Run  contentUI/options -> background to control
		 * fromStart: 是否新打开页面获取总页数再开始抓取步骤
		 */
		manualRunOneCommunityTask: ProtocolWithReturn<{city:string,cid:string,maxPage:number,fromStart?:boolean}, {resp:string}>;


		/**
		 * background/side panel  -> content to parse
		 */
		parseOneCommunityListOnePage: ProtocolWithReturn<{}, CommunityListPageItem>;
		/**
		 * DAO
		 */
		addCommunityTask: ProtocolWithReturn<CommunityTask, {resp:string}>;
		queryCommunityTask: ProtocolWithReturn<{cid:string}, CommunityTask[]>;

	}
}
