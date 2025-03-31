import { onMessage } from "@/messaging";
import { parseAllOfKeRentCommunity } from "../util/ke-rent-community-dom-parse";

export function keRentCommunityListPageOnMessages() {
  /**
   * 解析当前列表页面, 并返回解析结果
   */
  onMessage("parseKeCommunityListOnePage", async (data) => {
    return await parseAllOfKeRentCommunity();
  });
}
