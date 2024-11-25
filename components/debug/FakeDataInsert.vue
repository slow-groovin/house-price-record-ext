<script setup lang="ts">

import {Button} from "@/components/ui/button";
import houseTaskJson from './data/mongo-output.json'
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

async function addHouseTaskFromJson(){
  const data=houseTaskJson.map(item=>{
    return {
      ...item,
      addedType:TaskAddedType.forDebug,
      status: HouseTaskStatus.running,
      autoRecord: false,
      accessRecord: new AccessRecord(new Date(item.createdAt)),
    }as HouseTask

  })

  const rs=await db.houseTasks.bulkAdd(data)
  alert('suc:'+rs)
}

async function deleteHouseTaskFromJson(){
  const data=houseTaskJson.forEach(item=>{
    db.houseTasks.where('hid').equals(item.hid).delete()
    db.houseChanges.where('hid').equals(item.hid).delete()
    db.houseCommonFieldChanges.where('hid').equals(item.hid).delete()
  })


  const rs=await db.houseTasks.where('hid').equals('123').delete()
  alert(rs)
}

async function addHouseChangesData(){
  const data=houseChangesJson.map(item=>{
    return {
      ...item,
      cid: item.cid+'',
      hid: item.hid+'',
    }as HouseChange
  })
  const rs=await db.houseChanges.bulkAdd(data)
  alert(rs)
}
async function removeHouseChangesData(){
  houseChangesJson.map(async (item)=>{
    const rs=await db.houseChanges.where(['hid','at','oldValue','newValue']).equals([item.hid,item.at,item.oldValue,item.newValue]).delete()
  })
}

async function addCommunityRecordData(){
  const tasks=communityTaskJson.map(item=>{
    return {
      ...item,
      cid: item.cid+'',
      city: 'bj',
      status: CommunityTaskStatus.running,
      houseList:undefined,
      accessRecord: new AccessRecord(),
      createdAt: item.at,
      lastRunningAt: item.at,
      runningCount: 1,
    }as CommunityTask
  })
  const rs1=await db.communityTasks.bulkAdd(tasks)
  const records=communityTaskJson.map(item=>{
    return {
      ...item,
      cid: item.cid+'',
      city: 'bj',
    }as CommunityRecord
  })
  const rs2=await db.communityRecords.bulkAdd(records)
  alert(rs1+' '+rs2)
}

async function deleteCommunityRecordData(){
  const data=communityTaskJson.forEach(item=>{
    db.communityTasks.where('cid').equals(item.cid+'').delete()
    db.communityRecords.where('cid').equals(item.cid+'').delete()
  })
  alert('delete community task done')
}
</script>

<template>
<div class="c-block">
  <div>
    <h2> house task</h2>
    <Button @click="console.log(houseTaskJson)">log </Button>
    <Button @click="addHouseTaskFromJson">insert </Button>
    <Button @click="deleteHouseTaskFromJson">delete (just inserted)</Button>
  </div>
  <div>
    <h2> house changes</h2>
    <Button @click="console.log(houseChangesJson)">log </Button>
    <Button @click="addHouseChangesData">insert </Button>
    <Button @click="removeHouseChangesData">delete (just inserted)</Button>
  </div>
  <div>
    <h2> community task</h2>
    <Button @click="console.log(communityTaskJson)">log </Button>
    <Button @click="addCommunityRecordData">insert </Button>
    <Button @click="deleteCommunityRecordData">delete (just inserted)</Button>
  </div>

</div>
</template>

<style scoped>

</style>