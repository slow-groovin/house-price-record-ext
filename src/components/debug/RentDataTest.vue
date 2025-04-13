<template>
  <div class="p-4 space-y-4">
    <div class="flex space-x-2">
      <Button @click="deleteAll">deleteAll </Button>
      <Button @click="createTables">createTables </Button>
      <Button @click="migrateFakeDataFromSell">gen from sell </Button>
      <Button @click="checkDbState">checkDbState </Button>
    </div>
    <Separator />
    <div>
      <h3 class="text-lg font-semibold mb-2">Execute SQL</h3>
      <textarea v-model="sqlInput" placeholder="Enter SQL query here..." class="mb-2 font-mono w-full" rows="5" />
      <Button @click="executeSql">Execute</Button>
      <div v-if="sqlResult !== null" class="mt-4 p-2 border rounded bg-muted">
        <h4 class="font-semibold mb-1">Result:</h4>
        <pre class="text-sm overflow-auto">{{ JSON.stringify(sqlResult, null, 2) }}</pre>
      </div>
      <div v-if="sqlError" class="mt-4 p-2 border rounded bg-destructive text-destructive-foreground">
        <h4 class="font-semibold mb-1">Error:</h4>
        <pre class="text-sm overflow-auto">{{ sqlError }}</pre>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { db } from "@/entrypoints/db/Dexie";
import { RentDao } from "@/entrypoints/db/rent-dao";
import { Separator } from '@/components/ui/separator'
import { TableNames } from "@/entrypoints/db/sqlite";
import { getDb, createTables } from "@/entrypoints/db/sqlite";
import { RentHouse, RentPriceChangeItem } from "@/types/rent";
import { Button } from "../ui/button";

const sqlInput = ref('');
const sqlResult = ref<any>(null);
const sqlError = ref<string | null>(null);

async function executeSql() {
  sqlResult.value = null;
  sqlError.value = null;
  if (!sqlInput.value.trim()) {
    sqlError.value = 'SQL query cannot be empty.';
    return;
  }
  try {
    const db = await getDb();
    // Use db.exec for general queries, db.run for specific actions if needed
    // For SELECT queries, db.select is often preferred as it returns results directly.
    // Let's try db.select first, assuming it's a SELECT query. Fallback might be needed.
    // Note: db.run might be better for general purpose execution including SELECT, INSERT, UPDATE, DELETE etc.
    // Let's stick with db.run for simplicity as it handles various statement types.
    const result = await db.run(sqlInput.value);
    sqlResult.value = result;
    console.log("EXEC SQL DONE");

  } catch (error: any) {
    console.error("Error executing SQL:", error);
    sqlError.value = error.message || 'An unknown error occurred.';
  }
}

async function checkDbState() {
  const db = await getDb()
  // console.log('db.sqlite.libversion_number()', db.sqlite.libversion_number())
  // console.log('db', db)
  // console.log('db.sqlite', db.sqlite)
  console.log((db.vfs as any)['lastError'])
}

async function deleteAll() {
  const db = await getDb()
  // await db.run(`
  // DELETE FROM ${TableNames.keRent.community};
  // DELETE FROM ${TableNames.keRent.house};
  // DELETE FROM ${TableNames.keRent.price_change};
  // DELETE FROM ${TableNames.keRent.status_change};
  // DELETE FROM ${TableNames.keRent.record};
  // `)

  await db.run(`
  DROP TABLE  ${TableNames.keRent.community};
  DROP TABLE  ${TableNames.keRent.house};
  DROP TABLE  ${TableNames.keRent.price_change};
  DROP TABLE  ${TableNames.keRent.status_change};
  DROP TABLE  ${TableNames.keRent.record};
  `)
  console.log('delete all done.')

}
async function migrateFakeDataFromSell() {
  const sqlite = await getDb()
  const BATCHSIZE = 1000; // 定义批量大小
  const dao = new RentDao('ke')

  const tasks = await db.communityTasks.toArray()
  for (const t of tasks) {
    await dao.insertCommunity({
      cid: t.cid,
      city: t.city,
      createdAt: t.createdAt,
      lastRunningAt: t.lastRunningAt,
      runningCount: t.runningCount,
      name: t.name
    })
  }

  console.log('migrate communitys done.')



  const houses = await db.houseTasks.toArray()
  for (let i = 0; i < houses.length; i += 1000) {
    const slice = houses.slice(i, Math.min(houses.length, i + 1000))
    await sqlite.run('BEGIN TRANSACTION;');
    for (const h of slice) {
      await dao.insertHouse({
        rid: h.hid,
        cid: h.cid,
        city: h.city,
        name: h.name,
        area: h.area,
        status: h.status,
        createdAt: h.createdAt,
        lastRunningAt: h.lastRunningAt,
        price: h.totalPrice!,
        desc: h.area + ' ' + h.roomSubType + ' ' + h.buildingType + ' ' + h.roomSubType
      })
    }
    await sqlite.run('COMMIT;');
  }
  const houseCount = await sqlite.run("SELECT COUNT(*) as count FROM " + TableNames.keRent.house)
  console.log('migrate houses done. count:', houseCount[0]['count'])


  const changes = await db.houseChanges.toArray()
  // 使用 for 循环和 BATCHSIZE 进行批量处理
  for (let i = 0; i < changes.length; i += BATCHSIZE) {
    const slice = changes.slice(i, Math.min(changes.length, i + BATCHSIZE))
    await sqlite.run('BEGIN TRANSACTION;'); // 开始事务
    for (const c of slice) {
      await dao.insertPriceChange({
        rid: c.hid,
        cid: c.cid,
        at: c.at,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })
    }
    await sqlite.run('COMMIT;'); // 提交事务
  }
  console.log('migrate price changes done.')

  const statusChanges = await db.houseStatusChanges.toArray()
  // 使用 for 循环和 BATCHSIZE 进行批量处理
  for (let i = 0; i < statusChanges.length; i += BATCHSIZE) {
    const slice = statusChanges.slice(i, Math.min(statusChanges.length, i + BATCHSIZE))
    await sqlite.run('BEGIN TRANSACTION;'); // 开始事务
    for (const c of slice) {
      await dao.insertStatusChange({
        rid: c.hid,
        cid: c.cid,
        at: c.at,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })
    }
    await sqlite.run('COMMIT;'); // 提交事务
  }
  console.log('migrate status changes done.')


  const records = await db.communityRecords.toArray()
  await sqlite.run('BEGIN TRANSACTION;'); // 开始事务

  for (const r of records) {
    await dao.insertRecord({
      cid: r.cid,
      city: r.city!,
      list: r.houseList?.map(i => ({
        rid: i.hid,
        price: i.price,
      }) as Partial<RentHouse>),
      added: r.addedItem?.map(i => ({
        rid: i.hid,
        price: i.price,
      }) as Partial<RentHouse>) ?? [],
      removed: r.removedItem?.map(i => ({
        rid: i.hid,
        price: i.price,
      }) as Partial<RentHouse>) ?? [],
      priceDownList: r.priceDownList?.map(i => ({
        rid: i.hid,
        price: i.price,
        oldPrice: i.oldPrice
      }) as RentPriceChangeItem) ?? [],
      priceUpList: r.priceUpList?.map(i => ({
        rid: i.hid,
        price: i.price,
        oldPrice: i.oldPrice,

      }) as RentPriceChangeItem) ?? [],
      at: r.at,
      count: r.onSellCount ?? 0,
      avgPrice: r.avgTotalPrice ?? 0,
    })
  }
  await sqlite.run('COMMIT;'); // 提交事务

  console.log('migrate records done.')
}
</script>
