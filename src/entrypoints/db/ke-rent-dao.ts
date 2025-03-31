import { KeRentCommunityTask } from "@/types/lj-rent";
import { insert, select } from "sql-bricks";
import { getDb, TableNames } from "../db/sqlite";
export async function queryKeRentCommunityTask(cid: string) {
  const sql = select()
    .from(TableNames.keRent.community)
    .where({ cid: cid })
    .toString();
  const sqliteDb = await getDb();
  const results = (await sqliteDb.run(sql)) as KeRentCommunityTask[];
  return results;
}

export async function addKeRentCommunityTask(task: KeRentCommunityTask) {
  const sql = insert(TableNames.keRent.community, task).toString();
  const sqliteDb = await getDb();
  await sqliteDb.run(sql);
  return;
}
