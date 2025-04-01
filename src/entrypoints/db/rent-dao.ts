import {
  RentCommunityRecord,
  RentCommunityTask,
  RentHouse,
  RentHousePriceChange,
  RentHouseStatusChange,
} from "@/types/rent";
import {
  and,
  insert,
  like,
  select,
  WhereExpression,
  in as _in,
  lt,
  gt,
  ltAll,
  eq,
  lte,
  gte,
} from "sql-bricks";
import { getDb, TableNames } from "./sqlite";
import {
  HouseChangeQueryCondition,
  HouseStatusChangeQueryCondition,
  HouseTaskQueryCondition,
  RentCommunityQueryCondition,
  SortState,
} from "@/types/query-condition";
import { calcOffset } from "@/utils/table-utils";
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
    return TableNames.keRent;
  }

  /**
   * 静态工厂函数
   */
  static from(platform: "ke" | "5i5j" = "ke") {
    return new RentDao(platform);
  }

  async findCommunityById(cid: string) {
    const sql = select()
      .from(this.#tableName.community)
      .where({ cid: cid })
      .toString();
    const sqliteDb = await getDb();
    const results = (await sqliteDb.run(sql)) as RentCommunityTask[];
    return results;
  }

  async findCommunitiesByCids(cidList: string[]) {
    const sql = select()
      .from(this.#tableName.community)
      .where(_in("cid", cidList))
      .toString();
    const sqliteDb = await getDb();
    const rs = (await sqliteDb.run(sql)) as RentCommunityTask[];

    return rs;
  }

  async insertCommunity(task: RentCommunityTask) {
    const sql = insert(this.#tableName.community, task).toString();
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
    const whereConditions: WhereExpression[] = [];
    if (query?.cidLike) {
      whereConditions.push(like("cid", `%${query.cidLike}%`));
    }
    if (query?.nameLike) {
      whereConditions.push(like("name", `%${query.nameLike}%`));
    }
    if (query?.city) {
      whereConditions.push({ city: query.city });
    }

    const whereCond =
      whereConditions.length === 0 ? {} : and(...whereConditions);

    console.log("query", query, whereConditions, whereCond);
    let builder = select().from(this.#tableName.community).where(whereCond);

    let countBuilder = select("count(*) count")
      .from(this.#tableName.community)
      .where(whereCond);

    if (sort && sort.field && sort.order) {
      builder = builder.order(sort.field + " " + sort.order);
    }

    let sql = builder.toString();
    let offset = calcOffset(pagination.pageIndex, pagination.pageSize);
    sql += ` LIMIT ${pagination.pageSize} OFFSET ${offset}`;
    console.log("sql", sql);

    const sqliteDb = await getDb();
    const results = (await sqliteDb.run(sql)) as RentCommunityTask[];
    const countResult = (await sqliteDb.run(countBuilder.toString())) as [
      { count: number }
    ];

    return {
      count: countResult[0].count,
      data: results,
    };
  }

  async findLastTwoRecordsByCid(cid: string) {
    const sql =
      select()
        .from(this.#tableName.record)
        .where({ cid: cid })
        .order("id desc")
        .toString() + " LIMIT 2";

    console.log("sql", sql);
    const sqliteDb = await getDb();

    let results = await sqliteDb.run(sql);
    return results.map((item) => {
      return {
        ...(item as RentCommunityRecord),
        list: JSON.parse(item.list) as RentHouse[],
        added: JSON.parse(item.added) as RentHouse[],
        removed: JSON.parse(item.removed) as RentHouse[],
        priceUpList: JSON.parse(item.priceUpList) as RentHouse[],
        priceDownList: JSON.parse(item.priceDownList) as RentHouse[],
      } as RentCommunityRecord;
    });
  }

  async deleteTasks(idList: number[]) {
    const sql = `DELETE FROM ${this.#tableName.community} WHERE id IN (${idList
      .map((id) => `'${id}'`)
      .join(",")})`;
    const sqliteDb = await getDb();
    const rs = await sqliteDb.run(sql);
    console.log("deleteTasks result:", rs);
    return;
  }

  /*
  Houses
  */

  async insertHouse(house: RentHouse) {
    const sql = insert(this.#tableName.house, house).toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }

  async findHousesByRid(ridList: string[]) {
    const sql = select()
      .from(this.#tableName.house)
      .where(_in("rid", ridList))
      .toString();
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
    const whereConditions: WhereExpression[] = [];
    if (query?.cidInclude)
      whereConditions.push(like("cid", `%${query.cidInclude}%`));

    if (query?.cidEqual) whereConditions.push({ cid: query.cidEqual });

    if (query?.city) whereConditions.push({ city: query.city });

    if (query?.hidInclude)
      whereConditions.push(like("rid", `%${query.hidInclude}%`));

    if (query?.status) whereConditions.push({ status: query.status });

    if (query?.totalPriceMax)
      whereConditions.push(lt("price", query.totalPriceMax));

    if (query?.totalPriceMin)
      whereConditions.push(gt("price", query.totalPriceMin));

    const whereCond =
      whereConditions.length === 0 ? {} : and(...whereConditions);

    console.log("query", query, whereConditions, whereCond);
    let builder = select().from(this.#tableName.house).where(whereCond);

    let countBuilder = select("count(*) count")
      .from(this.#tableName.house)
      .where(whereCond);

    if (sort && sort.field && sort.order) {
      builder = builder.order(sort.field + " " + sort.order);
    }

    let sql = builder.toString();
    let offset = calcOffset(pagination.pageIndex, pagination.pageSize);
    sql += ` LIMIT ${pagination.pageSize} OFFSET ${offset}`;
    console.log("sql", sql);

    const sqliteDb = await getDb();
    const results = (await sqliteDb.run(sql)) as RentHouse[];
    const countResult = (await sqliteDb.run(countBuilder.toString())) as [
      { count: number }
    ];

    return {
      count: countResult[0].count,
      data: results,
    };
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
    const sql = insert(this.#tableName.record, flatRecord).toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }
  /*
   * Changes
   */
  async insertPriceChange(change: RentHousePriceChange) {
    const sql = insert(this.#tableName.price_change, change).toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }

  async insertStatusChange(change: RentHousePriceChange) {
    const sql = insert(this.#tableName.status_change, change).toString();
    const sqliteDb = await getDb();
    await sqliteDb.run(sql);
    return;
  }

  async findPriceChangesByRids(ridList: string[]) {
    const sql = select()
      .from(this.#tableName.price_change)
      .where(_in("rid", ridList))
      .toString();
    console.log("sql", sql);
    const sqliteDb = await getDb();
    return (await sqliteDb.run(sql)) as RentHousePriceChange[];
  }

  /**
   * delete change by id
   */
  async deleteChangeById(id: number) {
    const sql = `DELETE FROM ${this.#tableName.price_change} WHERE id = ${id}`;
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
    query?: HouseChangeQueryCondition & HouseStatusChangeQueryCondition,
    sort?: SortState<RentHousePriceChange>
  ): Promise<{
    count: number;
    data: (T extends "price" ? RentHousePriceChange : RentHouseStatusChange)[];
  }> {
    const whereConditions: WhereExpression[] = [
      { 1: 1 },
      { placeholder: "placeholder" },
    ];

    if (query?.atMax) {
      whereConditions.push(lt("at", new Date(query.atMax).getTime()));
    }
    if (query?.atMin) {
      whereConditions.push(gt("at", new Date(query.atMin).getTime()));
    }
    if (query?.cidInclude) {
      whereConditions.push(like("cid", `%${query.cidInclude}%`));
      whereConditions.push(like("cid", `%${query.cidInclude}%`));
    }
    if (query?.hidInclude)
      whereConditions.push(like("rid", `%${query.hidInclude}%`));

    if (query?.newValue) whereConditions.push(eq("newValue", query.newValue));
    if (query?.oldValue) whereConditions.push(eq("oldValue", query.oldValue));

    if (query?.newValueMax)
      whereConditions.push(lt("newValue", query.newValueMax));
    if (query?.newValueMin)
      whereConditions.push(gt("newValue", query.newValueMin));

    if (query?.oldValueMax)
      whereConditions.push(lt("oldValue", query.oldValueMax));
    if (query?.oldValueMin)
      whereConditions.push(gt("oldValue", query.oldValueMin));

    const whereCond =
      whereConditions.length === 0 ? {} : and(...whereConditions);

    const tableName =
      type === "price"
        ? this.#tableName.price_change
        : this.#tableName.status_change;

    let builder = select().from(tableName).where(whereCond);

    let countBuilder = select("count(*) count")
      .from(tableName)
      .where(whereCond);

    if (sort && sort.field && sort.order) {
      builder = builder.order(sort.field + " " + sort.order);
    }

    builder = builder.order("id desc");

    let sql = builder.toString();
    let offset = calcOffset(pagination.pageIndex, pagination.pageSize);
    sql += ` LIMIT ${pagination.pageSize} OFFSET ${offset}`;
    let countSql = countBuilder.toString();

    //special condition
    const PLACE_HOLDER = `placeholder = \'placeholder\'`;
    // !prettier-ignore
    if (query?.type === "increase") {
      sql = sql.replace(PLACE_HOLDER, "oldValue < newValue");
      countSql = countSql.replace(PLACE_HOLDER, "oldValue < newValue");
    } else if (query?.type === "decrease") {
      sql = sql.replace(PLACE_HOLDER, "oldValue > newValue");
      countSql = countSql.replace(PLACE_HOLDER, "oldValue > newValue");
    } else {
      sql = sql.replace(PLACE_HOLDER, "1=1");
      countSql = countSql.replace(PLACE_HOLDER, "1=1");
    }
    console.log("sql", sql);

    const sqliteDb = await getDb();
    const results = await sqliteDb.run(sql);
    const typedResults =
      type === "price"
        ? (results as RentHousePriceChange[])
        : (results as RentHouseStatusChange[]);

    const countResult = (await sqliteDb.run(countSql)) as [{ count: number }];

    return {
      count: countResult[0].count,
      data: typedResults,
    };
  }
}
