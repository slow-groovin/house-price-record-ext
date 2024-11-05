import { ProtocolWithReturn } from "webext-bridge";
import type {HouseItem} from '@/types/houseItem'
import type {StorageItem} from '@/types/storage.js'
declare module "webext-bridge" {
	export interface ProtocolMap {
		block: ProtocolWithReturn<{enable:boolean}, {resp:string}>,
		houseItem: ProtocolWithReturn<HouseItem,{resp:string}>
		// to specify the return type of the message,
		// use the `ProtocolWithReturn` type wrapper
		bar: ProtocolWithReturn<{}, {}>;
	}
}
