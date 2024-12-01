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
  HouseTask,
  HouseTaskStatus,
  TaskAddedType
} from "@/types/lj";
import {db} from "@/utils/client/Dexie";
import {AccessRecord} from "@/utils/lib/AcessRecord";
const houseData = ()=>houseTaskJson.map(item => {
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

async function logCidUndefined(){
  console.log(await db.houseTasks.where('cid').equals('undefined').toArray())
}

// 查询重复的 `email` 记录
async function findDuplicateEmails() {
  const hidCounts:Record<string, number> = {};
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
</script>

<template>
  <div class="c-block">
    <div>
      <h2> house task</h2>
      <Button @click="console.log(houseData())">log</Button>
      <Button @click="addHouseTaskFromJson">insert</Button>
      <Button @click="deleteHouseTaskFromJson">delete (just inserted)</Button>
    </div>
    <div>
      <h2> house changes</h2>
      <Button @click="console.log(houseChangesJson)">log</Button>
      <Button @click="addHouseChangesData">insert</Button>
      <Button @click="removeHouseChangesData">delete (just inserted)</Button>
    </div>
    <div>
      <h2> community task</h2>
      <Button @click="console.log(communityTaskJson)">log</Button>
      <Button @click="addCommunityRecordData">insert</Button>
      <Button @click="deleteCommunityRecordData">delete (just inserted)</Button>
    </div>



  </div>

  <div class="c-block">
    <h1> data select/purge</h1>
    <div class="flex flex-row flex-wrap gap-4">
      <Button @click="logCidUndefined">log cid is undefined</Button>
      <Button @click="findDuplicateEmails().then(rs=>console.log(rs))">log duplicate hids</Button>
    </div>
  </div>
</template>

<style scoped>

</style>