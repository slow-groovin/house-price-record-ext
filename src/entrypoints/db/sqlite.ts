// import wasmUrl from "@subframe7536/sqlite-wasm/dist/wa-sqlite-async.wasm?url";  //这样导入使用会导致wasm以字节码嵌入到background.js/content.js中, 导致wasm的内容重复打包多次
import { AsyncLock, wrapAsyncFunction } from "@/utils/lib/AsyncLock";
import { initSQLite, SQLiteDB } from "@subframe7536/sqlite-wasm";
import { useIdbStorage } from "@subframe7536/sqlite-wasm/idb";

const schemas = `
CREATE TABLE IF NOT EXISTS ke_rent_community (
      cid TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      city TEXT NOT NULL ,
      createdAt INTEGER NOT NULL,
      lastRunningAt INTEGER NOT NULL,
      runningCount INTEGER NOT NULL
    );
CREATE INDEX IF NOT EXISTS idx_created_at ON ke_rent_community(createdAt);
CREATE INDEX IF NOT EXISTS idx_name ON ke_rent_community(name);



CREATE TABLE IF NOT EXISTS ke_rent_house (
      rid TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      cid TEXT NOT NULL,
      city TEXT NOT NULL,
      desc TEXT,
      area REAL,
      source TEXT,
      price INTEGER,
      status INTEGER,
      createdAt INTEGER NOT NULL,
      releasedAt INTEGER,
      lastRunningAt INTEGER NOT NULL);

CREATE INDEX IF NOT EXISTS idx_name ON ke_rent_house(name);
CREATE INDEX IF NOT EXISTS idx_cid ON ke_rent_house(cid);
CREATE INDEX IF NOT EXISTS idx_status ON ke_rent_house(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON ke_rent_house(createdAt);
CREATE INDEX IF NOT EXISTS idx_released_at ON ke_rent_house(releasedAt);

CREATE TABLE IF NOT EXISTS ke_rent_community_record ( 
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  cid TEXT NOT NULL,
  city TEXT NOT NULL,
  name TEXT,

  avgPrice INTEGER,
  count INTEGER,

  list TEXT,
  added TEXT,
  removed TEXT,
  priceUpList TEXT,
  priceDownList TEXT,

  maxPageNo INTEGER,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cid ON ke_rent_community_record(cid);
CREATE INDEX IF NOT EXISTS idx_name ON ke_rent_community_record(name);
CREATE INDEX IF NOT EXISTS idx_at ON ke_rent_community_record(at);


CREATE TABLE IF NOT EXISTS ke_rent_house_price_change (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  rid TEXT NOT NULL,
  cid TEXT NOT NULL,
  newValue INTEGER,
  oldValue INTEGER,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rid ON ke_rent_house_price_change(rid);
CREATE INDEX IF NOT EXISTS idx_cid ON ke_rent_house_price_change(cid);
CREATE INDEX IF NOT EXISTS idx_at ON ke_rent_house_price_change(at);


CREATE TABLE IF NOT EXISTS ke_rent_house_status_change (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rid TEXT NOT NULL,
  cid TEXT NOT NULL,
  newValue INTEGER,
  oldValue INTEGER,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rid ON ke_rent_house_status_change(rid);
CREATE INDEX IF NOT EXISTS idx_cid ON ke_rent_house_status_change(cid);
CREATE INDEX IF NOT EXISTS idx_at ON ke_rent_house_status_change(at);
`;

export const TableNames = {
  keRent: {
    community: "ke_rent_community",
    house: "ke_rent_house",
    record: "ke_rent_community_record",
    price_change: "ke_rent_house_price_change",
    status_change: "ke_rent_house_status_change",
  },
} as const;

let sqliteDb: SQLiteDB | undefined;

export async function createTables() {
  await (await getDb()).run(schemas);
}

const lock = new AsyncLock();

export async function getDb() {
  // const number = uid(6);
  // console.log("[getDb]", number);
  await lock.acquire();

  if (sqliteDb && (sqliteDb.vfs as any)["lastError"]) {
    console.debug(
      "Sqlite DB instance has error, recreate instance",
      (sqliteDb.vfs as any)["lastError"]
    );
    sqliteDb = undefined;
  }
  if (sqliteDb) {
    // console.log("[getDb]already created.", number);
    lock.release();
    return sqliteDb;
  }
  sqliteDb = await initSQLite(
    useIdbStorage("main.db", {
      url: "/wa-sqlite-async.wasm",
      lockTimeout: 500,
    })
  );
  const seqLock = new AsyncLock();
  wrapAsyncFunction(
    sqliteDb,
    "run",
    async (...args: any[]) => {
      await seqLock.acquire();
    },
    () => seqLock.release()
  );

  lock.release();
  // console.log("[getDb][Create sqlite instance]done", number);

  return sqliteDb;
}
