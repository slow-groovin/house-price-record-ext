import { TaskGroup2 } from "@/types/group";
import { db } from "../db/Dexie";
import { KeRentDao } from "../db/rent-dao";
import { goRunCommunityTasksStartPage } from "./community-control";
import { goRunHouseTasksStartPage } from "./house-control2";
import { goRunRentCommunityTasksStartPage } from "./rent-community-control";
import { sleep } from "radash";

export async function goRunGroupTask(group: TaskGroup2) {
  if (!group) {
    return;
  }
  const ljSellCidList = group.ljSellCidList;
  if (ljSellCidList.length) {
    const ljSellCommunityList = await db.communityTasks
      .where("cid")
      .anyOf(ljSellCidList)
      .toArray();
    await goRunCommunityTasksStartPage(ljSellCommunityList);
  }

  const ljSellHidList = group.ljSellHidList;
  if (ljSellHidList.length) {
    await sleep(5000);
    await goRunHouseTasksStartPage(ljSellHidList);
  }

  const keRentCidList = group.keRentCidList;
  if (keRentCidList.length) {
    await sleep(5000);
    const keRentCommunityList = await KeRentDao().findCommunitiesByCids(
      keRentCidList
    );
    await goRunRentCommunityTasksStartPage(keRentCommunityList);
  }

  db.taskGroups.update(group.id, {
    lastRunningAt: Date.now(),
  });
}
