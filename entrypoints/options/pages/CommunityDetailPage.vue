<script setup lang="ts">
import {useRoute} from "vue-router";
import {db} from "@/utils/client/Dexie";
import ObjectTable from "@/components/table/ObjectTable.vue";
import {CommunityRecord, CommunityTask, HouseChange, HouseStatusChange, HouseTask} from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import {Button} from "@/components/ui/button";
import HouseChangesTable from "@/entrypoints/options/components/HouseChangesTable.vue";
import {calcOffset} from "@/utils/table-utils";
import HouseTasksTable from "@/entrypoints/options/components/HouseTasksTable.vue";
import CommunityRecordTable from "@/entrypoints/options/components/CommunityRecordTable.vue";
import {onMounted, ref, toRaw} from "vue";
import {genCommunityPageUrl} from "@/utils/lj-url";
import HouseStatusChangesTimeline from "@/entrypoints/options/components/HouseStatusChangesTimeline.vue";
import {startPageEntry} from "@/entrypoints/reuse/community-control2";

const {query}=useRoute()
const cid=query['id'] as string

const task=ref<CommunityTask>()

const records=ref<CommunityRecord[]>([])
const recordsCount=ref(0)

const houseTasks=ref<HouseTask[]>([])
const houseTasksCount=ref(0)

const changes=ref<HouseChange[]>([])
const changesCount=ref(0)

const statusChanges=ref<HouseStatusChange[]>([])
const statusChangesCount=ref(0)



async function queryData(){
  task.value=await db.communityTasks.where('cid').equals(cid).first()
  records.value=await db.communityRecords.where('cid').equals(cid).toArray()
  let accessRecord = toRaw(task.value?.accessRecord);
  console.log('task:',toRaw(task.value),accessRecord)
  console.log('records:',toRaw(records.value))
  console.log('accessRecord?.startDate:',accessRecord?.startDate, typeof accessRecord?.startDate)
}

async function queryChanges(pageIndex:number,pageSize:number){
  const offset=calcOffset(pageIndex,pageSize)
  console.log(pageIndex,pageSize,offset)
  changes.value=await db.houseChanges.where('cid').equals(cid).reverse().offset(offset).limit(pageSize).toArray()
  changesCount.value=await db.houseChanges.where('cid').equals(cid).count()
}

async function queryStatusChanges(pageIndex:number,pageSize:number){
  const offset=calcOffset(pageIndex,pageSize)
  console.log(pageIndex,pageSize,offset)
  statusChanges.value=await db.houseStatusChanges.where('cid').equals(cid).reverse().offset(offset).limit(pageSize).toArray()
  statusChangesCount.value=await db.houseStatusChanges.where('cid').equals(cid).count()
}

async function queryHouseTasks(pageIndex:number,pageSize:number) {
  houseTasks.value = await db.houseTasks.where('cid').equals(cid).offset(calcOffset(pageIndex, pageSize)).limit(pageSize).toArray()
  houseTasksCount.value = await db.houseTasks.where('cid').equals(cid).count()
}

async function queryRecords(pageIndex:number,pageSize:number) {
  records.value = await db.communityRecords.where('cid').equals(cid).reverse().offset(calcOffset(pageIndex, pageSize)).limit(pageSize).toArray()
  recordsCount.value = await db.communityRecords.where('cid').equals(cid).count()
}

function task2ObjectTableData(t:CommunityTask){
  return {
    ...t,
    createdAt: new Date(t?.createdAt).toLocaleString(),
    lastRunningAt: new Date(t?.lastRunningAt).toLocaleString()
  }
}
onMounted(()=>{
  queryData()
  // queryChanges(1,10)
})
</script>

<template>
  <div class="c-block">
    <h1> {{cid}}</h1>
  </div>
  <div class="c-block" v-if="task">
    <h2>actions</h2>
    <div>
      <Button @click="startPageEntry([toRaw(task)])">beginTaskCrawl</Button>
      <a  :href="genCommunityPageUrl(task!.city as string,task?.cid,1)" target="_blank"  rel="noreferrer">link</a>
    </div>
  </div>

  <div class="c-block">
    <h2> task </h2>
    <ObjectTable v-if="task" :data="task2ObjectTableData(task)"/>
    <details>
      <summary>task</summary>
      <pre>{{task}}</pre>
    </details>
  </div>

  <div class="c-block">
    <!-- changes history -->
    <h2> changes history </h2>
    <HouseChangesTable :data="changes ?? []" :row-count="changesCount ?? 0" @on-pagination-change="queryChanges"/>
  </div>

  <div class="c-block">
    <!-- changes history -->
    <h2> status changes history </h2>
    <HouseStatusChangesTimeline :data="statusChanges ?? []" :row-count="statusChangesCount ?? 0" @on-pagination-change="queryStatusChanges"/>
  </div>

<!-- graph -->
<!-- house list -->
  <div class="c-block">
    <h2>house list</h2>
    <HouseTasksTable :data="houseTasks" :row-count="houseTasksCount" @on-pagination-change="queryHouseTasks"/>
  </div>



  <div class="c-block">
    <h2>community record</h2>
    <CommunityRecordTable :data="records" :row-count="recordsCount" @on-pagination-change="queryRecords"/>
  </div>

  <div class="c-block">
    <h2>access record</h2>
    <CalendarGraph v-if="task" :access-record="AccessRecord.fromAccessRecord(task?.accessRecord)"/>
  </div>
</template>

<style scoped>

</style>