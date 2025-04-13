import { HouseTaskStatus } from "@/types/lj";

export const HStatusZh: Record<HouseTaskStatus, string> = {
  [HouseTaskStatus.running]: "正常",
  [HouseTaskStatus.sold]: "成交",
  [HouseTaskStatus.miss]: "下架",
  [HouseTaskStatus.void]: "未创建",
  [HouseTaskStatus.pause]: "暂停",
};
export const HStatusColor: Record<HouseTaskStatus, string> = {
  [HouseTaskStatus.running]: "green-500",
  [HouseTaskStatus.sold]: "blue-500",
  [HouseTaskStatus.miss]: "yellow-500",
  [HouseTaskStatus.void]: "",
  [HouseTaskStatus.pause]: "brown-500",
};

export const HStatusDesc: Record<HouseTaskStatus, string> = {
  [HouseTaskStatus.running]: "房源在售, 可以访问查看",
  [HouseTaskStatus.sold]: "房源显示已成交",
  [HouseTaskStatus.miss]: "房源无法访问, 下架(但是没有成交)",
  [HouseTaskStatus.void]: "还未对此房源创建任务",
  [HouseTaskStatus.pause]: "暂停",
};
