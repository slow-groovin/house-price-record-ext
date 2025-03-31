import { AccessRecord } from "@/utils/lib/AcessRecord";

export type KeRentCommunityTask = {
  id?: number;
  cid: string;
  name?: string;

  city?: string;
  accessRecord: AccessRecord;

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
