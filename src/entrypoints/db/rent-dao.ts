import { HouseTaskStatus } from "@/types/lj";
import {
  HouseChangeQueryCondition,
  HouseStatusChangeQueryCondition,
  HouseTaskQueryCondition,
  RentCommunityQueryCondition,
  SortState,
} from "@/types/query-condition";
import {
  RentCommunityRecord,
  RentCommunityTask,
  RentHouse,
  RentHousePriceChange,
  RentHouseStatusChange,
  RentModelUtils,
} from "@/types/rent";
import { logger } from "@/utils/log";
import { calcOffset } from "@/utils/table-utils";
import { squel } from "sqlify"; // Import squel
import { getDb, TableNames } from "./sqlite";
import { db } from "./Dexie";
export function KeRentDao() {
  return RentDao.from("ke");
}
export class RentDao {
  #platform: "ke" | "5i5j";

  /**
   * 根据设置区分表名, 两种的功能完全一致
   * @param platform
   */
  constructor(platform: "ke" | "5i5j" = "ke") {
    this.#platform = platform;
  }

  /**
   * 根据设置获取表名集合
   */
  get #tableName() {
    if (this.#platform === "ke") {
      return TableNames.keRent;
    }
    // Assuming 5i5j uses the same tables for now, adjust if needed
    return TableNames.keRent;
  }

  /**
   * 静态工厂函数
   */
  static from(platform: "ke" | "5i5j" = "ke") {
    return new RentDao(platform);
  }

  async findCommunityByCid(cid: string) {
    const sql = squel
      .select()
      .from(this.#tableName.community)
      .where("cid = ?", cid)
      .toString();
    const sqliteDb = await getDb();
    const results = (await sqliteDb.run(sql)) as RentCommunityTask[];
    return results;
  }

  async findFirstCommunityByCid(cid: string) {
    const sql = squel
      .select()
      .from(this.#tableName.community)
      .where("cid = ?", cid)
      .limit(1) // Added limit 1 to get only the first
      .toString();
    const sqliteDb = await getDb();
    const results = (await sqliteDb.run(sql)) as RentCommunityTask[];
    return results[0];
  }

  async findCommunitiesByCids(cidList: string[]) {
    if (cidList.length === 0) return [];

    const sql = squel
      .select()
      .from(this.#tableName.community)
      .where("cid IN ?", cidList)
      .toString();
    const sqliteDb = await getDb();
    const rs = (await sqliteDb.run(sql)) as RentCommunityTask[];

    return rs;
  }

  async insertCommunity(task: RentCommunityTask) {
    const sql = squel
      .insert()
      .into(this.#tableName.community)
      .setFields(task)
      .toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }

  async findManyCommunities(
    pagination: {
      /**
       * start from 1
       */
      pageIndex: number;
      pageSize: number;
    },
    query?: RentCommunityQueryCondition,
    sort?: SortState<RentCommunityTask>
  ) {
    let builder = squel.select().from(this.#tableName.community);
    let countBuilder = squel
      .select()
      .field("count(*) count")
      .from(this.#tableName.community);

    if (query?.cidLike) {
      const condition = "cid LIKE ?";
      builder = builder.where(condition, `%${query.cidLike}%`);
      countBuilder = countBuilder.where(condition, `%${query.cidLike}%`);
    }
    if (query?.nameLike) {
      const condition = "name LIKE ?";
      builder = builder.where(condition, `%${query.nameLike}%`);
      countBuilder = countBuilder.where(condition, `%${query.nameLike}%`);
    }
    if (query?.city) {
      const condition = "city = ?";
      builder = builder.where(condition, query.city);
      countBuilder = countBuilder.where(condition, query.city);
    }
    if (query?._groupId) {
      const cidList = (await db.taskGroups.get(query._groupId))?.keRentCidList;
      if (cidList) {
        if (!cidList.length) cidList.push("");
        if (cidList) {
          builder = builder.where("cid IN ?", cidList);
          countBuilder = countBuilder.where("cid IN ?", cidList);
        }
      }
    }

    if (sort && sort.field && sort.order) {
      builder = builder.order(sort.field, sort.order === "asc");
    } else {
      // Default sort if not provided or incomplete
      builder = builder.order("createdAt", false); // false for DESC
    }

    let offset = calcOffset(pagination.pageIndex, pagination.pageSize);
    builder = builder.limit(pagination.pageSize).offset(offset);

    const sql = builder.toString();
    const countSql = countBuilder.toString();
    logger.log("sql", sql);
    logger.log("countSql", countSql);

    const sqliteDb = await getDb();
    const results = (await sqliteDb.run(sql)) as RentCommunityTask[];
    const countResult = (await sqliteDb.run(countSql)) as [{ count: number }];

    return {
      count: countResult[0].count,
      data: results,
    };
  }

  async findLastTwoRecordsByCid(cid: string) {
    const sql = squel
      .select()
      .from(this.#tableName.record)
      .where("cid = ?", cid)
      .order("id", false) // false for DESC
      .limit(2)
      .toString();

    logger.log("sql", sql);
    const sqliteDb = await getDb();

    let results = await sqliteDb.run(sql);
    return results.map((item) => {
      return RentModelUtils.unserializeRentCommunityRecord(item);
    });
  }

  async deleteTasks(cidList: string[]) {
    if (cidList.length === 0) return [];
    const sql = squel
      .delete()
      .from(this.#tableName.community)
      .where("cid IN ?", cidList)
      .toString();
    const sqliteDb = await getDb();
    const rs = await sqliteDb.run(sql);
    logger.log("deleteTasks result:", rs);
    return;
  }

  async incRunningCount(cid: string, at: number) {
    const sqliteDb = await getDb();
    // squel doesn't directly support 'SET runningCount = runningCount + 1' easily across DBs
    // Using raw SQL for this specific update remains the simplest approach here.
    const sql = `UPDATE ${this.#tableName.community
      } SET runningCount = runningCount + 1, lastRunningAt = ? WHERE cid = ?`;
    logger.log("sql", sql, [at, cid]);
    const rs = await sqliteDb.run(sql, [at, cid]);
    return rs;
  }

  async countCommunity(option?: { createdAtMin: number }) {
    let builder = squel
      .select()
      .field("count(*) count")
      .from(this.#tableName.community);
    if (option?.createdAtMin) {
      builder = builder.where("createdAt >= ?", option.createdAtMin);
    }
    const sql = builder.toString();
    const sqliteDb = await getDb();
    const rs = (await sqliteDb.run(sql)) as [{ count: number }];
    return rs[0].count;
  }

  /*
  Houses
  */

  async insertHouse(house: RentHouse) {
    const sql = squel
      .insert()
      .into(this.#tableName.house)
      .setFields(house)
      .toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }

  async findHouseByRid(rid: string) {
    const sql = squel
      .select()
      .from(this.#tableName.house)
      .where("rid = ?", rid)
      .toString();
    const sqliteDb = await getDb();
    const rs = (await sqliteDb.run(sql)) as RentHouse[];

    return rs[0];
  }

  async findHousesByRid(ridList: string[]) {
    if (ridList.length === 0) return [];
    const sql = squel
      .select()
      .from(this.#tableName.house)
      .where("rid IN ?", ridList)
      .toString();

    logger.log(sql);
    const sqliteDb = await getDb();
    const rs = (await sqliteDb.run(sql)) as RentHouse[];

    return rs;
  }

  async findManyHouses(
    pagination: {
      pageIndex: number; //start from 1
      pageSize: number;
    },
    query?: HouseTaskQueryCondition,
    sort?: SortState<RentHouse>
  ) {
    let builder = squel.select().from(this.#tableName.house);
    let countBuilder = squel
      .select()
      .field("count(*) count")
      .from(this.#tableName.house);

    if (query?.cidInclude) {
      const condition = "cid LIKE ?";
      builder = builder.where(condition, `%${query.cidInclude}%`);
      countBuilder = countBuilder.where(condition, `%${query.cidInclude}%`);
    }
    if (query?.cidEqual) {
      const condition = "cid = ?";
      builder = builder.where(condition, query.cidEqual);
      countBuilder = countBuilder.where(condition, query.cidEqual);
    }
    if (query?.city) {
      const condition = "city = ?";
      builder = builder.where(condition, query.city);
      countBuilder = countBuilder.where(condition, query.city);
    }
    if (query?.hidInclude) {
      const condition = "rid LIKE ?";
      builder = builder.where(condition, `%${query.hidInclude}%`);
      countBuilder = countBuilder.where(condition, `%${query.hidInclude}%`);
    }
    if (query?.status) {
      const condition = "status = ?";
      builder = builder.where(condition, query.status);
      countBuilder = countBuilder.where(condition, query.status);
    }
    if (query?.totalPriceMax) {
      const condition = "price < ?";
      builder = builder.where(condition, query.totalPriceMax);
      countBuilder = countBuilder.where(condition, query.totalPriceMax);
    }
    if (query?.totalPriceMin) {
      const condition = "price > ?";
      builder = builder.where(condition, query.totalPriceMin);
      countBuilder = countBuilder.where(condition, query.totalPriceMin);
    }

    if (sort && sort.field && sort.order) {
      builder = builder.order(sort.field, sort.order === "asc");
    } else {
      builder = builder.order("createdAt", false); // false for DESC
    }

    let offset = calcOffset(pagination.pageIndex, pagination.pageSize);
    builder = builder.limit(pagination.pageSize).offset(offset);

    const sql = builder.toString();
    const countSql = countBuilder.toString();
    logger.log("sql", sql);
    logger.log("countSql", countSql);

    const sqliteDb = await getDb();
    const results = (await sqliteDb.run(sql)) as RentHouse[];
    const countResult = (await sqliteDb.run(countSql)) as [{ count: number }];

    return {
      count: countResult[0].count,
      data: results,
    };
  }
  async updateHouse(rid: string, fields: any) {
    const sqliteDb = await getDb();
    const sql = squel
      .update()
      .table(this.#tableName.house)
      .setFields(fields)
      .where("rid = ?", rid)
      .toString();
    return await sqliteDb.run(sql);
  }

  async deleteHouses(ridList: string[]) {
    if (ridList.length === 0) return [];

    const sql = squel
      .delete()
      .from(this.#tableName.house)
      .where("rid IN ?", ridList)
      .toString();
    const sqliteDb = await getDb();
    const rs = await sqliteDb.run(sql);
    logger.log("deleteTasks result:", rs);
    return;
  }

  async countHoues(option?: { createdAtMin: number }) {
    let builder = squel
      .select()
      .field("count(*) count")
      .from(this.#tableName.house);
    if (option?.createdAtMin) {
      builder = builder.where("createdAt >= ?", option.createdAtMin);
    }
    const sql = builder.toString();
    const sqliteDb = await getDb();
    const rs = (await sqliteDb.run(sql)) as [{ count: number }];
    return rs[0].count;
  }
  /*
   * Records
   */
  async insertRecord(record: RentCommunityRecord) {
    const flatRecord = {
      ...record,
      added: JSON.stringify(record.added),
      removed: JSON.stringify(record.removed),
      list: JSON.stringify(record.list),
      priceDownList: JSON.stringify(record.priceDownList),
      priceUpList: JSON.stringify(record.priceUpList),
    };
    const sql = squel
      .insert()
      .into(this.#tableName.record)
      .setFields(flatRecord)
      .toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }

  async findManyRecords(
    pagination: {
      pageIndex: number; //start from 1
      pageSize: number;
    },
    query: {
      cidEqual?: string;
      atMin?: number;
      atMax?: number;
    }
  ) {
    let builder = squel.select().from(this.#tableName.record);
    let countBuilder = squel
      .select()
      .field("count(*) count")
      .from(this.#tableName.record);

    if (query?.cidEqual) {
      const condition = "cid = ?";
      builder = builder.where(condition, query.cidEqual);
      countBuilder = countBuilder.where(condition, query.cidEqual);
    }
    if (query?.atMin) {
      const condition = "at >= ?";
      builder = builder.where(condition, query.atMin);
      countBuilder = countBuilder.where(condition, query.atMin);
    }
    if (query?.atMax) {
      const condition = "at <= ?";
      builder = builder.where(condition, query.atMax);
      countBuilder = countBuilder.where(condition, query.atMax);
    }

    builder = builder.order("id", false); // false for DESC

    let offset = calcOffset(pagination.pageIndex, pagination.pageSize);
    builder = builder.limit(pagination.pageSize).offset(offset);

    const sql = builder.toString();
    const countSql = countBuilder.toString();
    logger.log("sql", sql);
    logger.log("countSql", countSql);

    const sqliteDb = await getDb();
    const results = (await sqliteDb.run(sql)).map(
      RentModelUtils.unserializeRentCommunityRecord
    );
    const countResult = (await sqliteDb.run(countSql)) as [{ count: number }];

    return {
      count: countResult[0].count,
      data: results,
    };
  }
  async findFirstRecordByCidAndBefore(cid: string, at: number) {
    const sql = squel
      .select()
      .from(this.#tableName.record)
      .where("cid = ?", cid)
      .where("at <= ?", at)
      .order("id", false) // false for DESC
      .limit(1)
      .toString();
    const sqliteDb = await getDb();
    const results = await sqliteDb.run(sql);
    return results.map((item) =>
      RentModelUtils.unserializeRentCommunityRecord(item)
    )[0];
  }
  async findFirstRecordByCidAndAfter(cid: string, at: number) {
    const sql = squel
      .select()
      .from(this.#tableName.record)
      .where("cid = ?", cid)
      .where("at >= ?", at)
      .order("id", false) // false for DESC, assuming we want the latest record after 'at'
      .limit(1)
      .toString();
    const sqliteDb = await getDb();
    const results = await sqliteDb.run(sql);
    return results.map((item) =>
      RentModelUtils.unserializeRentCommunityRecord(item)
    )[0];
  }

  async findRecordsByCid(cid: string) {
    const sql = squel
      .select()
      .from(this.#tableName.record)
      .where("cid = ?", cid)
      .order("id", false) // false for DESC
      .toString();
    const sqliteDb = await getDb();
    const results = await sqliteDb.run(sql);
    return results.map((item) =>
      RentModelUtils.unserializeRentCommunityRecord(item)
    );
  }
  async findRecordsById(id: number) {
    const sql = squel
      .select()
      .from(this.#tableName.record)
      .where("id = ?", id)
      // .order("id desc") // Ordering by id desc is redundant when selecting by id
      .toString();
    const sqliteDb = await getDb();
    const results = await sqliteDb.run(sql);
    return results.map((item) =>
      RentModelUtils.unserializeRentCommunityRecord(item)
    )[0];
  }

  async deleteRecordById(id: number) {
    const sql = squel
      .delete()
      .from(this.#tableName.record)
      .where("id = ?", id)
      .toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }

  async countRecordByCid(cid: string) {
    const sql = squel
      .select()
      .field("count(*) count")
      .from(this.#tableName.record)
      .where("cid = ?", cid)
      .toString();
    const sqliteDb = await getDb();
    const results = (await sqliteDb.run(sql)) as [{ count: number }];
    return results[0].count;
  }

  async countRecords(option?: { createdAtMin: number }) {
    let builder = squel
      .select()
      .field("count(*) count")
      .from(this.#tableName.record);
    if (option?.createdAtMin) {
      builder = builder.where("createdAt >= ?", option.createdAtMin);
    }
    const sql = builder.toString();
    const sqliteDb = await getDb();
    const rs = (await sqliteDb.run(sql)) as [{ count: number }];
    return rs[0].count;
  }
  /*
   * Changes
   */
  async insertPriceChange(change: RentHousePriceChange) {
    const sql = squel
      .insert()
      .into(this.#tableName.price_change)
      .setFields(change)
      .toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }

  async insertStatusChange(change: RentHouseStatusChange) {
    // Assuming RentHouseStatusChange has compatible fields for insertion
    const sql = squel
      .insert()
      .into(this.#tableName.status_change)
      .setFields(change)
      .toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }

  async findChangesByRidsAndType<T extends "price" | "status">(
    ridList: string[],
    type: T
  ): Promise<
    T extends "price" ? RentHousePriceChange[] : RentHouseStatusChange[]
  > {
    const tableName =
      type === "price"
        ? this.#tableName.price_change
        : this.#tableName.status_change;
    const sql = squel
      .select()
      .from(tableName)
      .where("rid IN ?", ridList)
      .toString();
    logger.log("sql", sql);
    const sqliteDb = await getDb();
    const results = await sqliteDb.run(sql);
    // We need to cast based on the type T, the caller expects the correct type.
    return results as T extends "price"
      ? RentHousePriceChange[]
      : RentHouseStatusChange[];
  }

  /**
   * delete change by id
   */
  async deleteChangeById(id: number, type: "price" | "status") {
    // Need to know which table to delete from
    const tableName =
      type === "price"
        ? this.#tableName.price_change
        : this.#tableName.status_change;
    const sql = squel.delete().from(tableName).where("id = ?", id).toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }

  async findManyChanges<T extends "price" | "status">(
    type: T,
    pagination: {
      /**
       * start from 1
       */
      pageIndex: number;
      pageSize: number;
    },
    query?: HouseChangeQueryCondition &
      HouseStatusChangeQueryCondition & { cidEqual?: string },
    sort?: SortState<RentHousePriceChange | RentHouseStatusChange> // Union type for sort
  ): Promise<{
    count: number;
    data: (T extends "price" ? RentHousePriceChange : RentHouseStatusChange)[];
  }> {
    const tableName =
      type === "price"
        ? this.#tableName.price_change
        : this.#tableName.status_change;

    let builder = squel.select().from(tableName);
    let countBuilder = squel.select().field("count(*) count").from(tableName);

    // Apply common filters
    if (query?.atMax) {
      const condition = "at < ?";
      const atMaxTs = new Date(query.atMax).getTime();
      builder = builder.where(condition, atMaxTs);
      countBuilder = countBuilder.where(condition, atMaxTs);
    }
    if (query?.atMin) {
      const condition = "at > ?";
      const atMinTs = new Date(query.atMin).getTime();
      builder = builder.where(condition, atMinTs);
      countBuilder = countBuilder.where(condition, atMinTs);
    }
    if (query?.cidInclude) {
      const condition = "cid LIKE ?";
      builder = builder.where(condition, `%${query.cidInclude}%`);
      countBuilder = countBuilder.where(condition, `%${query.cidInclude}%`);
    }
    if (query?.cidEqual) {
      const condition = "cid = ?";
      builder = builder.where(condition, query.cidEqual);
      countBuilder = countBuilder.where(condition, query.cidEqual);
    }
    if (query?.hidInclude) {
      const condition = "rid LIKE ?";
      builder = builder.where(condition, `%${query.hidInclude}%`);
      countBuilder = countBuilder.where(condition, `%${query.hidInclude}%`);
    }

    if (query?.newValue) {
      const condition = "newValue = ?";
      builder = builder.where(condition, query.newValue);
      countBuilder = countBuilder.where(condition, query.newValue);
    }
    if (query?.oldValue) {
      const condition = "oldValue = ?";
      builder = builder.where(condition, query.oldValue);
      countBuilder = countBuilder.where(condition, query.oldValue);
    }

    // Apply type-specific filters (price or status)
    if (type === "price") {
      if (query?.newValueMax) {
        const condition = "newValue < ?";
        builder = builder.where(condition, query.newValueMax);
        countBuilder = countBuilder.where(condition, query.newValueMax);
      }
      if (query?.newValueMin) {
        const condition = "newValue > ?";
        builder = builder.where(condition, query.newValueMin);
        countBuilder = countBuilder.where(condition, query.newValueMin);
      }
      if (query?.oldValueMax) {
        const condition = "oldValue < ?";
        builder = builder.where(condition, query.oldValueMax);
        countBuilder = countBuilder.where(condition, query.oldValueMax);
      }
      if (query?.oldValueMin) {
        const condition = "oldValue > ?";
        builder = builder.where(condition, query.oldValueMin);
        countBuilder = countBuilder.where(condition, query.oldValueMin);
      }
      // Price change type (increase/decrease)
      if (query?.type === "increase") {
        const condition = "newValue > oldValue";
        builder = builder.where(condition);
        countBuilder = countBuilder.where(condition);
      } else if (query?.type === "decrease") {
        const condition = "newValue < oldValue"; // Corrected logic
        builder = builder.where(condition);
        countBuilder = countBuilder.where(condition);
      }
    } else if (type === "status") {
      // Status change specific filters (if any in HouseStatusChangeQueryCondition)
      // Example:
      // if (query?.newStatus) {
      //   const condition = "newValue = ?";
      //   builder = builder.where(condition, query.newStatus);
      //   countBuilder = countBuilder.where(condition, query.newStatus);
      // }
    }

    // Apply sorting
    if (sort && sort.field && sort.order) {
      builder = builder.order(sort.field, sort.order === "asc");
    } else {
      builder = builder.order("id", false); // Default sort: id DESC
    }

    // Apply pagination
    let offset = calcOffset(pagination.pageIndex, pagination.pageSize);
    builder = builder.limit(pagination.pageSize).offset(offset);

    const sql = builder.toString();
    const countSql = countBuilder.toString();
    logger.log("sql", sql);
    logger.log("countSql", countSql);

    const sqliteDb = await getDb();
    const results = await sqliteDb.run(sql);
    const countResult = (await sqliteDb.run(countSql)) as [{ count: number }];

    // Cast results based on T
    const typedResults = results as T extends "price"
      ? RentHousePriceChange[]
      : RentHouseStatusChange[];

    return {
      count: countResult[0].count,
      data: typedResults,
    };
  }

  async countChanges(option?: {
    type?: "price" | "status";
    priceType?: "up" | "down";
    statusType?: "added" | "removed";
    atMin?: number;
  }) {
    const tableName =
      option?.type === "status" // Corrected: check status first as it's simpler
        ? this.#tableName.status_change
        : this.#tableName.price_change; // Default to price change

    let builder = squel.select().field("count(*) count").from(tableName);

    if (option?.type === "price") {
      if (option?.priceType === "up") {
        builder = builder.where("newValue > oldValue");
      } else if (option?.priceType === "down") {
        builder = builder.where("newValue < oldValue"); // Corrected logic
      }
    } else if (option?.type === "status") {
      if (option?.statusType === "added") {
        builder = builder.where("newValue = ?", HouseTaskStatus.running);
      } else if (option?.statusType === "removed") {
        builder = builder.where("newValue = ?", HouseTaskStatus.miss);
      }
    }

    if (option?.atMin) {
      builder = builder.where("at >= ?", option.atMin);
    }

    const sql = builder.toString();
    logger.log(sql);
    const sqliteDb = await getDb();
    const rs = (await sqliteDb.run(sql)) as [{ count: number }];
    return rs[0].count;
  }

  /**
   * Export/Import
   */
  async exportAll() {
    const sqliteDb = await getDb();
    const communities = (await sqliteDb.run(
      `SELECT * FROM ${this.#tableName.community}`
    )) as RentCommunityTask[];
    const houses = (await sqliteDb.run(
      `SELECT * FROM ${this.#tableName.house}`
    )) as RentHouse[];
    const records = (await sqliteDb.run(
      `SELECT * FROM ${this.#tableName.record}`
    )) as RentCommunityRecord[];
    const priceChanges = (await sqliteDb.run(
      `SELECT * FROM ${this.#tableName.price_change}`
    )) as RentHousePriceChange[];
    const statusChanges = (await sqliteDb.run(
      `SELECT * FROM ${this.#tableName.status_change}`
    )) as RentHouseStatusChange[];
    return {
      communities,
      houses,
      records,
      priceChanges,
      statusChanges,
    };
  }
  async importAll(data: Awaited<ReturnType<typeof this.exportAll>>) {
    const sqliteDb = await getDb();
    const { communities, houses, priceChanges, records, statusChanges } = data;
    const sql1 = squel
      .insert()
      .into(this.#tableName.community)
      .setFieldsRows(communities)
      .onConflict()
      .returning("cid")
      .toString();
    const sql2 = squel
      .insert()
      .into(this.#tableName.house)
      .setFieldsRows(houses)
      .onConflict()
      .returning("rid")
      .toString();
    const sql3 = squel
      .insert()
      .into(this.#tableName.record)
      .setFieldsRows(records)
      .onConflict()
      .returning("id")
      .toString();
    const sql4 = squel
      .insert()
      .into(this.#tableName.price_change)
      .setFieldsRows(priceChanges)
      .onConflict()
      .returning("id")
      .toString();
    const sql5 = squel
      .insert()
      .into(this.#tableName.status_change)
      .setFieldsRows(statusChanges)
      .onConflict()
      .returning("id")
      .toString();

    let rs1 = 0, rs2 = 0, rs3 = 3, rs4 = 0, rs5 = 0
    if (communities.length) {
      await sqliteDb.run("BEGIN TRANSACTION");
      rs1 = (await sqliteDb.run(sql1)).length;
      console.log('import communities suc.')
      await sqliteDb.run('COMMIT;')
    }

    if (houses.length) {
      await sqliteDb.run("BEGIN TRANSACTION");
      rs2 = (await sqliteDb.run(sql2)).length;
      console.log('import houses suc.')
      await sqliteDb.run('COMMIT;')
    }

    if (records.length) {
      await sqliteDb.run("BEGIN TRANSACTION");
      rs3 = (await sqliteDb.run(sql3)).length;
      console.log('import records suc.')
      await sqliteDb.run('COMMIT;')
    }

    if (priceChanges.length) {
      await sqliteDb.run("BEGIN TRANSACTION");
      rs4 = (await sqliteDb.run(sql4)).length;
      console.log('import price changes suc.')
      await sqliteDb.run('COMMIT;')
    }

    if (statusChanges.length) {
      await sqliteDb.run("BEGIN TRANSACTION");
      rs5 = (await sqliteDb.run(sql5)).length;
      console.log('import status changes suc.')
      await sqliteDb.run('COMMIT;')
    }

    return [rs1, rs2, rs3, rs4, rs5];
  }
}
