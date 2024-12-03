<script setup lang="ts">

import {Button} from "@/components/ui/button";
import houseTaskJson from './data/mongo-h-task-output.json'
import houseChangesJson from './data/mongo-h-changes-output.json'
import communityTaskJson from './data/mongo-c-task-output.json'
import {
  CommunityRecord,
  CommunityTask,
  CommunityTaskStatus,
  HouseChange,
  HousePriceChangeItem,
  HousePriceItem,
  HouseStatusChange,
  HouseTask,
  HouseTaskStatus,
  TaskAddedType
} from "@/types/lj";
import {db} from "@/utils/client/Dexie";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import {list, random, toInt} from "radash";
import {extractAndRemove, extractElements, randArray} from "@/utils/array";
import {ref} from "vue";

const houseData = () => houseTaskJson.map(item => {
  return {
    ...item,
    addedType: TaskAddedType.forDebug,
    status: HouseTaskStatus.running,
    autoRecord: false,
    accessRecord: new AccessRecord(new Date(item.createdAt)),
  } as HouseTask
})

async function addHouseTaskFromJson() {
  const rs = await db.houseTasks.bulkAdd(houseData())
  alert('suc:' + rs)
}

async function deleteHouseTaskFromJson() {
  const data = houseTaskJson.forEach(item => {
    db.houseTasks.where('hid').equals(item.hid).delete()
    db.houseChanges.where('hid').equals(item.hid).delete()
    db.houseCommonFieldChanges.where('hid').equals(item.hid).delete()
  })


  const rs = await db.houseTasks.where('hid').equals('123').delete()
  alert(rs)
}

async function addHouseChangesData() {
  const data = houseChangesJson.map(item => {
    return {
      ...item,
      cid: item.cid + '',
      hid: item.hid + '',
    } as HouseChange
  })
  const rs = await db.houseChanges.bulkAdd(data)
  alert(rs)
}

async function removeHouseChangesData() {
  houseChangesJson.map(async (item) => {
    const rs = await db.houseChanges.where(['hid', 'at', 'oldValue', 'newValue']).equals([item.hid, item.at, item.oldValue, item.newValue]).delete()
  })
}

async function addCommunityRecordData() {
  const tasks = communityTaskJson.map(item => {
    return {
      ...item,
      cid: item.cid + '',
      city: 'bj',
      status: CommunityTaskStatus.running,
      houseList: undefined,
      accessRecord: new AccessRecord(),
      createdAt: item.at,
      lastRunningAt: item.at,
      runningCount: 1,
    } as CommunityTask
  })
  const rs1 = await db.communityTasks.bulkAdd(tasks)
  const records = communityTaskJson.map(item => {
    return {
      ...item,
      cid: item.cid + '',
      city: 'bj',
      maxPageNo: Math.floor(item.houseList.length / 30) + 1,
    } as CommunityRecord
  })
  const rs2 = await db.communityRecords.bulkAdd(records)
  alert(rs1 + ' ' + rs2)
}

async function deleteCommunityRecordData() {
  const data = communityTaskJson.forEach(item => {
    db.communityTasks.where('cid').equals(item.cid + '').delete()
    db.communityRecords.where('cid').equals(item.cid + '').delete()
  })
  alert('delete community task done')
}

async function logCidUndefined() {
  console.log(await db.houseTasks.where('cid').equals('undefined').toArray())
}

// 查询重复的 `hid` 记录
async function findDuplicateHid() {
  const hidCounts: Record<string, number> = {};
  const duplicateHid = [];

  // 遍历 `users` 表中的所有记录
  await db.houseTasks.each(task => {
    if (hidCounts[task.hid]) {
      hidCounts[task.hid]++;
    } else {
      hidCounts[task.hid] = 1;
    }
  });

  // 找出重复的邮箱
  for (const hid in hidCounts) {
    if (hidCounts[hid] > 1) {
      duplicateHid.push(hid);
    }
  }

  // 查找重复的记录
  const duplicateRecords = [];
  for (const hid of duplicateHid) {
    const records = await db.houseTasks.where('hid').equals(hid).toArray();
    duplicateRecords.push(...records);
  }

  return duplicateRecords;
}

// 打印db中一个community对应的所有记录
async function logSingleCommunityAll() {
  const task = await db.communityTasks.get(208)
  const houses = await db.houseTasks.where('cid').equals(task?.cid!).toArray()
  const changes = await db.houseChanges.where('cid').equals(task?.cid!).toArray()
  const statusChanges = await db.houseStatusChanges.where('cid').equals(task?.cid!).toArray()
  const records = await db.communityRecords.where('cid').equals(task?.cid!).toArray()
  console.log({task, records, houses, changes, statusChanges})
}

const randAccessRecord = () => new AccessRecord(new Date("2023-02-01T16:00:00.000Z"), new Uint32Array(list(random(1, 12)).map(() => random(1, 0xffffffffffffffff))))

const singleCommunityMockData = ref<any>()

async function genSingleCommunityAll() {
  const id = 300
  const cid = "t001"
  const initialCount = random(10, 20)

  let lastAt = new Date("2024-12-01T16:00:00.000Z").getTime();
  let beginAt = new Date("2024-01-01T16:00:00.000Z").getTime();
  const task: CommunityTask = {
    id, cid,
    accessRecord: new AccessRecord(new Date(beginAt), new Uint32Array([1234, 5678, 1660, 1080, 2070, 3060, 4050, 5090, 0b1111111000001111])),
    avgTotalPrice: 100,
    avgUnitPrice: 10000,
    city: "bj",
    createdAt: beginAt,
    doneCountIn90Days: 90,
    lastRunningAt: lastAt,
    name: "t001_NAME",
    onSellCount: initialCount,
    runningCount: 20,
    status: CommunityTaskStatus.running,
    visitCountIn90Days: 190,
  }
  const houses: HouseTask[] = []
  const allHouses: HouseTask[] = []
  let houseIndex = 1
  const newHouse = (no: number, at?: number) => ({
    hid: cid + "h" + no.toFixed(0).padStart(3, '0'),
    cid,
    city: 'bj',
    createdAt: at ?? beginAt,
    area: 100,
    buildingType: "金字塔",
    lastRunningAt: lastAt,
    name: "HOUSE_" + no,
    onSellDate: new Date("2023-04-04T16:00:00.000Z").getTime(),
    orientation: "银河系中心",
    totalPrice: 100,
    realArea: 50,
    realUnitPrice: 20000,
    roomSubType: "SUB_TYPE",
    roomType: "ROOM_TYPE",
    unitPrice: 10000,
    yearBuilt: "1999年",
    status: HouseTaskStatus.running,
    accessRecord: randAccessRecord(),
    addedType: TaskAddedType.autoByCommunity,
    autoRecord: false,
  } as HouseTask)

  for (let number of list(1, initialCount)) {
    let h = newHouse(houseIndex++, beginAt);
    houses.push(h)
    allHouses.push(h)
  }

  //records
  const records: CommunityRecord[] = []
  const changes: HouseChange[] = []
  const statusChanges: HouseStatusChange[] = []
  let at = beginAt
  while (at < lastAt) {
    at = at + random(1, 4) * 7 * 24 * 60 * 60 * 1000 //随机1~4周
    const removed: HousePriceItem[] = []
    const added: HousePriceItem = []
    const priceUpList: HousePriceChangeItem[] = [];
    const priceDownList: HousePriceChangeItem[] = [];

    //随机下架若干h
    const outIndex = randArray(random(0, 3), 0, houses.length)
    const outHouses = extractAndRemove(houses, outIndex)
    removed.push(outHouses.map(h => ({hid: h.hid, price: h.totalPrice} as HousePriceItem)))
    //更新task和changes
    outHouses.forEach(h => {
      h.status = HouseTaskStatus.sold
      h.soldDate = at
      h.accessRecord.setAccessStatus(new Date(at), true)
      statusChanges.push({
        cid,
        hid: h.hid,
        at,
        oldValue: HouseTaskStatus.running,
        newValue: HouseTaskStatus.sold,
      })
    })


    //随机up/down若干h
    const changeIndex = randArray(random(0, 3), 0, houses.length)
    const changeHouses = extractElements(houses, changeIndex)
    for (let h of changeHouses) {
      let oldVal = h.totalPrice
      let newVal = random(0, 100) < 50 ? oldVal + 10 : oldVal - 10
      if (newVal > oldVal) {
        priceUpList.push({
          hid: h.hid,
          price: newVal,
          oldPrice: oldVal,
        })
      } else {
        priceDownList.push({
          hid: h.hid,
          price: newVal,
          oldPrice: oldVal,
        })
      }
      h.totalPrice = newVal
      //changes
      changes.push({at: at, cid: cid, hid: h.hid, newValue: newVal, oldValue: oldVal} as HouseChange)
    }
    //随机上架若干h
    const upCount = random(0, 3)
    for (let i = 0; i < upCount; i++) {
      const h = newHouse(houseIndex++)
      allHouses.push(h)
      houses.push(h)
      added.push({
        hid: h.hid,
        price: h.totalPrice
      })
      //更新task和changes
      statusChanges.push({
        cid,
        hid: h.hid,
        at,
        oldValue: HouseTaskStatus.void,
        newValue: HouseTaskStatus.running,
      })
    }


    const record: CommunityRecord = {
      cid,
      city: "bj",
      maxPageNo: Math.floor(houses.length / 10) + 1,
      addedItem: added,
      priceDownList: priceDownList,
      priceUpList: priceUpList,
      removedItem: removed,
      at: at,
      avgTotalPrice: toInt(houses.reduce((acc, cur) => acc + cur.totalPrice, 0) / houses.length),
      avgUnitPrice: toInt(houses.reduce((acc, cur) => acc + cur.unitPrice, 0) / houses.length),
      calcOnSellCount: houses.length,
      houseList: houses,
      name: "t001_NAME",
      onSellCount: houses.length,
      pageNo: 0,
      visitCountIn90Days: random(0, 90),
      doneCountIn90Days: random(0, 90),
    }
    records.push(record)
  }

  return {task, allHouses, records, changes, statusChanges}
}

async function addMockData() {
  const rs = await genSingleCommunityAll()
  singleCommunityMockData.value = rs
  const {task, allHouses, records, changes, statusChanges} = rs
  //delete by cid
  await db.communityTasks.where('cid').equals(task.cid).delete()
  await db.communityRecords.where('cid').equals(task.cid).delete()
  await db.houseTasks.where('cid').equals(task.cid).delete()
  await db.houseChanges.where('cid').equals(task.cid).delete()
  await db.houseStatusChanges.where('cid').equals(task.cid).delete()
  //add
  await db.communityTasks.bulkAdd([task])
  await db.communityRecords.bulkAdd(records)
  await db.houseTasks.bulkAdd(allHouses)
  await db.houseChanges.bulkAdd(changes)
  await db.houseStatusChanges.bulkAdd(statusChanges)
}
</script>

<template>
  <div class="c-block">
    <div>
      <h2>multi house task</h2>
      <Button @click="console.log(houseData())">log</Button>
      <Button @click="addHouseTaskFromJson">insert</Button>
      <Button @click="deleteHouseTaskFromJson">delete (just inserted)</Button>
    </div>
    <div>
      <h2>multi house changes</h2>
      <Button @click="console.log(houseChangesJson)">log</Button>
      <Button @click="addHouseChangesData">insert</Button>
      <Button @click="removeHouseChangesData">delete (just inserted)</Button>
    </div>
    <div>
      <h2>multi community tasks</h2>
      <Button @click="console.log(communityTaskJson)">log</Button>
      <Button @click="addCommunityRecordData">insert</Button>
      <Button @click="deleteCommunityRecordData">delete (just inserted)</Button>
    </div>
    <div>
      <h2>mock: single community all</h2>
      <Button @click="logSingleCommunityAll">log all</Button>
      <Button @click="addMockData">gen Single community mock data</Button>
      <div v-if="singleCommunityMockData?.task">
        <a :href="'options.html#/c/task/detail?id='+singleCommunityMockData.task.cid" target="_blank">go detail </a>
        <details>
          <summary>single community mock data</summary>
          <pre>{{ singleCommunityMockData }}</pre>
        </details>
      </div>
    </div>


  </div>

  <div class="c-block">
    <h1> data select/purge</h1>
    <div class="flex flex-row flex-wrap gap-4">
      <Button @click="logCidUndefined">log cid is undefined</Button>
      <Button @click="findDuplicateHid().then(rs=>console.log(rs))">log duplicate hids</Button>


    </div>
  </div>
</template>

<style scoped>

</style>