import { db } from "@/utils/client/Dexie";
import { HouseNormal } from "@/types/LjUpdatePreview";
import { CommunityTask, HouseTask, HouseTaskStatus } from "@/types/lj";
import { updateOneNormal } from "@/entrypoints/reuse/house-update";
import { storage } from "#imports";
import { onMessage } from "@@/messaging";
import { getDb, TableNames } from "../reuse/sqlite";
import { insert, like, select } from "sql-bricks";
import { KeRentCommunityTask } from "@/types/lj-rent";

export function registerKeRentDaoMessage() {
  console.log("[registerKeRentDaoMessage]");
  onMessage("queryKeRentCommunityTask", async (msg) => {
    const cid = msg.data.cid;
    const sql = select()
      .from(TableNames.keRent.community)
      .where({ cid: cid })
      .toString();
    const sqliteDb = await getDb();
    const results = (await sqliteDb.run(sql)) as KeRentCommunityTask[];
    return results;
  });

  onMessage("addKeRentCommunityTask", async (msg) => {
    const task = msg.data;
    const sql = insert(TableNames.keRent.community, task).toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return {
      resp: "ok",
    };
  });
}
