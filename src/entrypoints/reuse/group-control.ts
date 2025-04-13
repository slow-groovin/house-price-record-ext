import { GroupIdType, TaskGroup2 } from "@/types/group";
import { db } from "../db/Dexie";
import { KeRentDao } from "../db/rent-dao";
import { goRunCommunityTasksStartPage } from "./community-control";
import { goRunHouseTasksStartPage } from "./house-control2";
import { goRunRentCommunityTasksStartPage } from "./rent-community-control";

export async function goRunGroupTask(group: TaskGroup2, type: GroupIdType) {
  if (!group) {
    console.warn("group is null");
    return;
  }
  if (type === "ljSellCid") {
    const ljSellCidList = group.ljSellCidList;
    if (ljSellCidList.length) {
      const ljSellCommunityList = await db.communityTasks
        .where("cid")
        .anyOf(ljSellCidList)
        .toArray();
      await goRunCommunityTasksStartPage(ljSellCommunityList);
    }
  }

  if (type === "ljSellHid") {
    const ljSellHidList = group.ljSellHidList;
    if (ljSellHidList.length) {
      await goRunHouseTasksStartPage(ljSellHidList);
    }
  }

  if (type === "keRentCid") {
    const keRentCidList = group.keRentCidList;
    if (keRentCidList.length) {
      const keRentCommunityList = await KeRentDao().findCommunitiesByCids(
        keRentCidList
      );
      await goRunRentCommunityTasksStartPage(keRentCommunityList);
    }
  }
  db.taskGroups.update(group.id, {
    lastRunningAt: Date.now(),
  });
}
