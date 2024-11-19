import { ProtocolWithReturn } from "webext-bridge";
import {HouseItem} from "@/types/lj";
declare module "webext-bridge" {
	export interface ProtocolMap {
		block: ProtocolWithReturn<{enable:boolean}, {resp:string}>,
		houseItem: ProtocolWithReturn<HouseItem,{resp:string}>,
		parseHouse: ProtocolWithReturn<{},HouseItem>,
		simple: ProtocolWithReturn<string,any>
		// to specify the return type of the message,
		// use the `ProtocolWithReturn` type wrapper
		bar: ProtocolWithReturn<{}, {}>;
	}
}
