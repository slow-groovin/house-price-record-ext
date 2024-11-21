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
		 * Auto Run  content -> background to control
		 */
		manualRunOneCommunityTask: ProtocolWithReturn<{urlList:string[]}, {resp:string}>;
		parseOneCommunityListOnePage: ProtocolWithReturn<{}, CommunityListPageItem>;
		/**
		 * DAO
		 */
		addCommunityTask: ProtocolWithReturn<CommunityTask, {resp:string}>;
		queryCommunityTask: ProtocolWithReturn<{cid:string}, CommunityTask[]>;

	}
}
