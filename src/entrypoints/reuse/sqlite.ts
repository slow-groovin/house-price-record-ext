import wasmUrl from "@subframe7536/sqlite-wasm/dist/wa-sqlite-async.wasm?url";
import { initSQLite, SQLiteDB } from "@subframe7536/sqlite-wasm";
import { useIdbStorage } from "@subframe7536/sqlite-wasm/idb";

const schemas = `
CREATE TABLE IF NOT EXISTS ke_rent_community (
      cid TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      city TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      lastRunningAt INTEGER NOT NULL,
      runningCount INTEGER NOT NULL
    );

CREATE TABLE IF NOT EXISTS ke_rent_house (
      rid TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      cid TEXT NOT NULL,
      desc TEXT,
      price INTEGER,
      status TEXT,
      createdAt INTEGER NOT NULL,
      lastRunningAt INTEGER NOT NULL);

CREATE TABLE IF NOT EXISTS ke_rent_community_record ( 
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  cid TEXT NOT NULL,
  city TEXT NOT NULL,

  avgPrice INTEGER,
  count INTEGER,

  list TEXT,
  added TEXT,
  removed TEXT,
  priceUpList TEXT
  priceDownList TEXT,
  at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ke_rent_house_price_change (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  rid TEXT NOT NULL,
  cid TEXT NOT NULL,
  newValue INTEGER,
  oldValue INTEGER,
  at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS ke_rent_house_status_change (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rid TEXT NOT NULL,
  cid TEXT NOT NULL,
  newValue INTEGER,
  oldValue INTEGER,
  at INTEGER NOT NULL
);
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

let sqliteDb: SQLiteDB;
export async function getDb() {
  if (sqliteDb) {
    return sqliteDb;
  }
  sqliteDb = await initSQLite(
    useIdbStorage("main.db", {
      url: wasmUrl,
    })
  );
  const rs = await sqliteDb.run(schemas);
  console.log("rs", rs);

  return sqliteDb;
}
