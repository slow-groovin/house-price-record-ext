import { parseAllOfKeRentCommunity } from "@/entrypoints/content/util/ke-rent-community-dom-parse";
import { AccessRecord } from "@/utils/lib/AcessRecord";

export type KeRentCommunityTask = {
  id?: number;
  cid: string;
  name?: string;

  city?: string;

  createdAt: number;
  lastRunningAt: number;
  runningCount: number; //
};

export type KeRentHouse = {
  rid: string; //rent id
  name?: string;
  cid: string;
  area: string;
  orientation?: string;
  roomType?: string;
  /**
   * 来源: 贝壳优选/链家/xx公寓
   */
  source?: string;
  createdAt: number;
  lastRunningAt: number;

  price: number;
};

export const KeRentModelUtils = {
  newCommunityTaskFromItem(
    input: Awaited<ReturnType<typeof parseAllOfKeRentCommunity>>
  ): KeRentCommunityTask {
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
