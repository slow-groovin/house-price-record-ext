import { onMessage } from "@@/messaging";
import { RentDao } from "../db/rent-dao";

export function registerKeRentDaoMessage() {
  console.log("[registerKeRentDaoMessage]");
  onMessage("queryKeRentCommunityTask", async (msg) => {
    const cid = msg.data.cid;
    return RentDao.from("ke").findCommunityById(cid);
  });

  onMessage("addKeRentCommunityTask", async (msg) => {
    const task = msg.data;
    await RentDao.from("ke").insertCommunity(task);
    return {
      resp: "ok",
    };
  });
}
