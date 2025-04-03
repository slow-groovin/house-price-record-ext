import { parseAllOfKeRentCommunity } from "@/entrypoints/content/util/ke-rent-community-dom-parse";
import { HouseTaskStatus } from "./lj";

export type ParsedRentCommunity = Awaited<
  ReturnType<typeof parseAllOfKeRentCommunity>
>;

export type RentCommunityTask = {
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

export interface RentPriceChangeItem {
  rid: string;
  price: number;
  oldPrice: number;
}

export type RentCommunityRecord = {
  id?: number;
  cid: string;
  city: string;
  name?: string;

  avgPrice: number;
  count: number;

  list: Partial<RentHouse>[];
  added: Partial<RentHouse>[];
  removed: Partial<RentHouse>[];
  priceUpList: RentPriceChangeItem[];
  priceDownList: RentPriceChangeItem[];

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

/*
 * Update Preview
 */
export interface RentCommunityUpdatePreview {
  batchId: string;
  tempListId: number; //临时表中的记录id
  at: number;
  records: RentCommunityRecord[];
}

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

  newHouseFromListItem(item: Partial<RentHouse>, cid: string): RentHouse {
    const itemR = item as Required<RentHouse>;
    return {
      ...itemR,
      status: HouseTaskStatus.running,
      createdAt: Date.now(),
      lastRunningAt: Date.now(),
      releasedAt: Date.now(),
      cid,
    };
  },

  unserializeRentCommunityRecord(item: Record<string, any>) {
    return {
      ...(item as RentCommunityRecord),
      list: JSON.parse(item.list ?? "") as RentHouse[],
      added: JSON.parse(item.added ?? "") as RentHouse[],
      removed: JSON.parse(item.removed ?? "") as RentHouse[],
      priceUpList: JSON.parse(item.priceUpList ?? "") as RentPriceChangeItem[],
      priceDownList: JSON.parse(
        item.priceDownList ?? ""
      ) as RentPriceChangeItem[],
    } as RentCommunityRecord;
  },
};
