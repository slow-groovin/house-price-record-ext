import { db } from "@/entrypoints/db/Dexie";
import { HouseNormal } from "@/types/LjUpdatePreview";
import { CommunityTask, HouseTask, HouseTaskStatus } from "@/types/lj";
import { updateOneNormal } from "@/entrypoints/reuse/house-update";
import { storage } from "#imports";
import { onMessage } from "@@/messaging";
import { getDb, TableNames } from "../db/sqlite";
import { insert, like, select } from "sql-bricks";
import { KeRentCommunityTask } from "@/types/lj-rent";
import {
  addKeRentCommunityTask,
  queryKeRentCommunityTask,
} from "../db/ke-rent-dao";

export function registerKeRentDaoMessage() {
  console.log("[registerKeRentDaoMessage]");
  onMessage("queryKeRentCommunityTask", async (msg) => {
    const cid = msg.data.cid;
    return queryKeRentCommunityTask(cid);
  });

  onMessage("addKeRentCommunityTask", async (msg) => {
    const task = msg.data;
    await addKeRentCommunityTask(task);
    return {
      resp: "ok",
    };
  });
}
