import { defineExtensionMessaging } from "@webext-core/messaging";
import {
  CommunityListPageItem,
  CommunityTask,
  HouseItem,
  HouseListDetailItem,
  HouseSoldItem,
  HouseTask,
} from "@/types/lj";
import { HouseNormal } from "@/types/LjUpdatePreview";
import { ParsedRentCommunity, RentCommunityTask } from "@/types/rent";
import { parseAllOfKeRentCommunity } from "@/entrypoints/content/util/ke-rent-community-dom-parse";

interface ProtocolMap {
  houseItem(houseItem: HouseItem): Promise<{ resp: string }>;
  parseHouse(): Promise<HouseItem>;
  parseHouseSold(): Promise<{ price: number; soldDate?: string }>;
  parseCommunitySoldList(): HouseSoldItem[];
  simple(msg: string): Promise<any>;
  echoTabId(msg: string): number;
  debug(msg: string): Promise<any>;

  bar(): Promise<{}>;
  openOptionPage(url: string): Promise<any>;
  getStorageLocal(key: string): Promise<any>;

  crawlCommunityTask(data: { cid: string }): Promise<{ resp: string }>;
  crawlHouseTask(data: { hid: string }): Promise<{ resp: string }>;

  parseOneCommunityListOnePage(): Promise<CommunityListPageItem>;
  parseKeCommunityListOnePage(): Promise<ParsedRentCommunity>;

  addCommunityTask(task: CommunityTask): Promise<{ resp: string }>;
  queryCommunityTask(data: { cid: string }): Promise<CommunityTask[]>;

  queryHouseTask(data: { hid: string }): Promise<HouseTask[]>;
  updateHouse(param: UpdateHouseParam): Promise<any>;
  createHouseTask(houseItem: HouseItem): Promise<{ reason?: string }>;

  /**
   * ke rent
   */
  addKeRentCommunityTask(task: RentCommunityTask): Promise<{ resp: string }>;
  queryKeRentCommunityTask(data: { cid: string }): Promise<RentCommunityTask[]>;
}

export type UpdateHouseParam = {
  houseNormal: HouseNormal;
  taskInDb: HouseTask;
};
export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
