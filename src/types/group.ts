export type TaskGroup = {
  id?: number;
  name: string;
  idList: string[];

  createdAt: number;
  lastRunningAt?: number;

  notification?: boolean;
  notifyInterval?: number;
};

export type TaskGroup2 = {
  id?: number;
  name: string;
  ljSellCidList: string[];
  ljSellHidList: string[];
  keRentCidList: string[];
  createdAt: number;
  lastRunningAt?: number;

  notification?: boolean;
  notifyInterval?: number;
};

export type GroupIdType = "ljSellCid" | "ljSellHid" | "keRentCid";

export function calcGroupSize(group: TaskGroup2) {
  if (!group) return 0;
  const { keRentCidList, ljSellCidList, ljSellHidList } = group;
  const size =
    keRentCidList.length + ljSellCidList.length + ljSellHidList.length;
  return size;
}
