import { parseAllOfKeRentCommunity } from "@/entrypoints/content/util/ke-rent-community-dom-parse";
import { HouseTaskStatus } from "./lj";

export type RentCommunityTask = {
  id?: number;
  cid: string;
  name?: string;

  city?: string;

  createdAt: number;
  lastRunningAt: number;
  runningCount: number; //
};

export type RentHouse = {
  rid: string; //rent id
  name?: string;
  cid: string;
  desc?: string;
  status: HouseTaskStatus;
  area?: number;

  /**
   * 来源: 贝壳优选/链家/xx公寓
   */
  source?: string;
  createdAt: number;
  lastRunningAt: number;
  /**
   * blue: 维护时间
   * yellow: 发布时间
   */
  releasedAt?: number;

  price: number;
};

export type RentCommunityRecord = {
  id?: number;
  cid: string;
  city: string;

  avgPrice: number;
  count: number;

  list?: Partial<RentHouse>[];
  added?: Partial<RentHouse>[];
  removed?: Partial<RentHouse>[];
  priceUpList?: Partial<RentHouse>[];
  priceDownList?: Partial<RentHouse>[];

  at: number;
};

export type RentHousePriceChange = {
  id?: number;
  rid: string;
  cid: string;

  oldValue: number;
  newValue: number;
  at: number;
};

export type RentHouseStatusChange = {
  id?: number;
  rid: string;
  cid: string;

  oldValue: HouseTaskStatus;
  newValue: HouseTaskStatus;
  at: number;
};

export const RentModelUtils = {
  newCommunityTaskFromItem(
    input: Awaited<ReturnType<typeof parseAllOfKeRentCommunity>>
  ): RentCommunityTask {
    return {
      cid: input.cid!,
      city: input.city!,
      createdAt: Date.now(),
      name: input.name,
      lastRunningAt: Date.now(),
      runningCount: 0,
    };
  },
};
