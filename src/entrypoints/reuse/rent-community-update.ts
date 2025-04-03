import { db } from "@/entrypoints/db/Dexie";
import { HousePriceItem, HouseTaskStatus } from "@/types/lj";
import {
  RentCommunityRecord,
  RentCommunityUpdatePreview,
  RentHouse,
  RentModelUtils,
  RentPriceChangeItem,
} from "@/types/rent";
import { tryGreaterThanOrFalse } from "@/utils/operator";
import { startOfWeek } from "date-fns";
import { objectify } from "radash";
import { KeRentDao } from "../db/rent-dao";
import { getDb } from "../db/sqlite";

/**
 * 批量更新community和新增record入口
 */
export async function updateBatchRentCommunityWithPreview(
  preview?: RentCommunityUpdatePreview
) {
  if (!preview) {
    alert("没有数据!");
    return { addedItem: [] };
  }

  for (let record of preview.records) {
    record.at = preview.at;
    const sqliteDb = await getDb();
    await sqliteDb.run("BEGIN TRANSACTION;");
    await updateOneRentCommunityWithRecord(record);
    await sqliteDb.run("COMMIT;");
  }
  // await db.tempBatchCommunity.delete(preview.tempListId);
  // await db.tempCommunityUpdatePreview.delete(preview.batchId);
}

/**
 * 和本周的最新一条record合并, 存入的record中表示变化的记录是相对于上周的记录
 */
async function updateOneRentCommunityWithRecord(record: RentCommunityRecord) {
  await autoUpdateOrCreateRentHouse(record);

  //本周的开始时刻
  const weekStartAt = startOfWeek(new Date(), { weekStartsOn: 1 }).getTime();
  //查询本周之前的第一个record
  const lastRecordBeforeThisWeek =
    await KeRentDao().findFirstRecordByCidAndBefore(record.cid, weekStartAt);

  //查询可能存在的本周的record
  const lastRecordThisWeek = await KeRentDao().findFirstRecordByCidAndAfter(
    record.cid,
    weekStartAt
  );

  const lastRecord = lastRecordBeforeThisWeek ?? lastRecordThisWeek;

  //如果存在lastRecordBeforeThisWeek, 则计算priceUp,priceDown, added,removed,
  if (lastRecord?.list && lastRecord?.list.length > 0) {
    const { priceUpList, priceDownList, removedItem, addedItem } =
      calculateListDifferences(record.list, lastRecord.list);

    //这四个表示变更的列表赋值为与本周之前的记录对比
    record.priceUpList = priceUpList;
    record.priceDownList = priceDownList;
    record.removed = removedItem;
    record.added = addedItem;
  }

  // 对removedItem,addedItem中的item更新状态, 如果存在lastRecordThisWeek则之更新相对于它的变更
  let removedItemForUpdate: Partial<RentHouse>[] = record.removed ?? [];
  let addedItemForUpdate: Partial<RentHouse>[] = record.added ?? [];
  if (lastRecordThisWeek && lastRecordThisWeek.list) {
    const { removedItem, addedItem } = calculateListDifferences(
      record.list,
      lastRecordThisWeek.list
    );
    removedItemForUpdate = removedItem;
    addedItemForUpdate = addedItem;
  }

  await updateAddedRemovedSoldItems(
    addedItemForUpdate,
    removedItemForUpdate,
    record.cid,
    record.at
  );

  // record 入库
  record.list = record.list?.map(({ price, rid }) => ({ rid, price }));
  await KeRentDao().insertRecord(record);

  /**
   * 更新task: 字段  lastRunningAt
   */
  await KeRentDao().incRunningCount(record.cid, record.at);

  //删除本周的record(相当于合并)
  if (lastRecordBeforeThisWeek && lastRecordThisWeek) {
    //如果存在本周之前的记录, 则直接删除本周记录
    console.log("[community-update]", record.cid, "合并本周的唯一记录");
    await KeRentDao().deleteRecordById(lastRecordThisWeek.id!);
  } else if (lastRecordThisWeek) {
    //如果不存在本周之前的记录,则根据记录总数判断是否是第一个记录
    const count = await KeRentDao().countRecordByCid(record.cid);
    if (count > 2) {
      //如果lastRecordThisWeek不是第一条, 则删除
      console.log(
        "[community-update]",
        record.cid,
        "当前是第一周, 合并上一条记录"
      );
      await KeRentDao().deleteRecordById(lastRecordThisWeek.id!);
    } else {
      console.log(
        "[community-update]",
        record.cid,
        "当前是第一周, 当前记录是第二条,不合并"
      );
    }
  }
}

/**
 * 为record中的houseList中的所有item自动创建任务或更新价格
 * @param record
 */
async function autoUpdateOrCreateRentHouse(record: RentCommunityRecord) {
  if (!record.list) {
    return;
  }
  const rids = record.list.map((i) => i.rid as string);
  const rentHouses = await KeRentDao().findHousesByRid(rids);
  const rentHouseMap = objectify(rentHouses, (r) => r.rid);
  for (let item of record.list) {
    if (!item.rid) continue;
    const task = rentHouseMap[item.rid];
    if (task) {
      //update price
      //如果price发生变动, 增加houseChanges记录
      if (item.price && task?.price !== item.price) {
        await KeRentDao().insertPriceChange({
          rid: item.rid,
          cid: record.cid,
          at: record.at,
          oldValue: task.price ?? -1,
          newValue: item.price,
        });
        //update price of task
        await KeRentDao().updateHouse(item.rid, { price: item.price });
        task.price = item.price;
      }
    } else {
      //create task
      if (!record.city) {
        console.error("record has no city!", record.city);
        return;
      }

      let houseTask = RentModelUtils.newHouseFromListItem(item, record.cid);
      await KeRentDao().insertHouse(houseTask);

      // create a task status change
      await KeRentDao().insertStatusChange({
        rid: item.rid,
        cid: record.cid,
        at: record.at,
        oldValue: HouseTaskStatus.void,
        newValue: HouseTaskStatus.running,
      });
    }
  }
}

/**
 * 为record中的removeItem中的项更新状态
 */
async function updateAddedRemovedSoldItems(
  addedItem: Partial<RentHouse>[],
  removedItem: Partial<RentHouse>[],
  cid: string,
  at: number
) {
  const rids = [...addedItem, ...removedItem]
    .filter((i) => !!i.rid)
    .map((i) => i.rid as string);
  const rentHouses = await KeRentDao().findHousesByRid(rids);
  const rentHouseMap = objectify(rentHouses, (r) => r.rid);

  for (let item of removedItem) {
    if (!item.rid) continue;
    const task = rentHouseMap[item.rid];

    if (task && task.status !== HouseTaskStatus.miss) {
      //如果状态发生变动, 增加houseChanges记录
      await KeRentDao().insertStatusChange({
        rid: item.rid,
        cid: cid,
        at: at,
        oldValue: task.status,
        newValue: HouseTaskStatus.miss,
      });
      await KeRentDao().updateHouse(item.rid, {
        status: HouseTaskStatus.miss,
        lastRunningAt: at,
      });
    }
  }

  for (let item of addedItem) {
    if (!item.rid) continue;
    const task = rentHouseMap[item.rid];
    if (task && task.status !== HouseTaskStatus.running) {
      //如果状态发生变动, 增加houseChanges记录
      await KeRentDao().insertStatusChange({
        rid: item.rid,
        cid: cid,
        at: at,
        oldValue: task.status,
        newValue: HouseTaskStatus.running,
      });
      await KeRentDao().updateHouse(item.rid, {
        status: HouseTaskStatus.running,
        lastRunningAt: at,
      });
    }
  }
}

/**
 * 计算并赋值record中几个表示相对于前一个变化值字段
 * 	priceUpList
 * 	priceDownList
 * 	removedItem
 * 	addedItem
 */
type CmpItem = { rid?: string; price?: number };
export function calculateListDifferences(
  target: CmpItem[] | undefined,
  toCompare: CmpItem[]
) {
  if (!target) {
    target = [];
  }
  if (!toCompare) {
    toCompare = [];
  }
  // 用于快速检索 toCompare 中的项
  const toCompareMap = new Map(toCompare.map((item) => [item.rid, item]));

  const priceUpList: RentPriceChangeItem[] = [];
  const priceDownList: RentPriceChangeItem[] = [];
  const removedItem: Partial<RentHouse>[] = [];
  const addedItem: Partial<RentHouse>[] = [];

  // 遍历 target 的每个项
  target.forEach((item) => {
    const compareItem = toCompareMap.get(item.rid);
    // 若 `hid` 不存在于 toCompare 中，标记为新增项
    if (!compareItem) {
      addedItem.push(item);
    }
    // 若存在相同 `hid`，对比价格
    if (compareItem) {
      if (tryGreaterThanOrFalse(item?.price, compareItem?.price)) {
        priceUpList.push({
          rid: item.rid!,
          price: item.price!,
          oldPrice: compareItem?.price ?? -1,
        }); // 价格上升
      } else if (tryGreaterThanOrFalse(compareItem?.price, item.price)) {
        priceDownList.push({
          rid: item.rid!,
          price: item.price!,
          oldPrice: compareItem?.price ?? -1,
        }); // 价格下降
      }
      toCompareMap.delete(item.rid); // 标记已处理
    }
  });

  // 剩余的 toCompare 项为被移除的项
  removedItem.push(...toCompareMap.values());

  // 返回对比结果
  return { priceUpList, priceDownList, removedItem, addedItem };
}
