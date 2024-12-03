<script setup lang="ts">
import {useRoute} from "vue-router";
import {db} from "@/utils/client/Dexie";
import {CommunityRecord, CommunityTask, HouseChange, HouseStatusChange, HouseTask} from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import HouseChangesTable from "@/entrypoints/options/components/HouseChangesTable.vue";
import {calcOffset} from "@/utils/table-utils";
import HouseTasksTable from "@/entrypoints/options/components/HouseTasksTable.vue";
import CommunityRecordTable from "@/entrypoints/options/components/CommunityRecordTable.vue";
import {onMounted, ref, toRaw} from "vue";
import HouseStatusChangesTimeline from "@/entrypoints/options/components/HouseStatusChangesTimeline.vue";
import CommunityTitleHead from "@/components/lj/community/detail/CommunityTitleHead.vue";
import FieldCardGroup from "@/components/lj/community/detail/FieldCardGroup.vue";
import TocNav from "@/components/float/TocNav.vue";
import DateRangePicker from "@/components/DateRangePicker.vue";
import {CalendarDate} from "@internationalized/date";

const {query} = useRoute()
const cid = query['id'] as string

const today = new Date()
const startDate = ref<CalendarDate>()
const endDate = ref<CalendarDate>()

endDate.value=new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDay())
startDate.value=endDate.value.subtract({years: 1})

const task = ref<CommunityTask>()

const records = ref<CommunityRecord[]>([])
const recordsCount = ref(0)

const houseTasks = ref<HouseTask[]>([])
const houseTasksCount = ref(0)

const changes = ref<HouseChange[]>([])
const changesCount = ref(0)

const statusChanges = ref<HouseStatusChange[]>([])
const statusChangesCount = ref(0)


async function queryData() {
  task.value = await db.communityTasks.where('cid').equals(cid).first()
  records.value = await db.communityRecords.where('cid').equals(cid).toArray()
  let accessRecord = toRaw(task.value?.accessRecord);
  console.log('task:', toRaw(task.value), accessRecord)
  console.log('records:', toRaw(records.value))
  console.log('accessRecord?.startDate:', accessRecord?.startDate, typeof accessRecord?.startDate)
}

async function queryChanges(pageIndex: number, pageSize: number) {
  const offset = calcOffset(pageIndex, pageSize)
  changes.value = await db.houseChanges.where('cid').equals(cid).reverse().offset(offset).limit(pageSize).toArray()
  changesCount.value = await db.houseChanges.where('cid').equals(cid).count()
}

async function queryStatusChanges(pageIndex: number, pageSize: number) {
  const offset = calcOffset(pageIndex, pageSize)
  statusChanges.value = await db.houseStatusChanges.where('cid').equals(cid).reverse().offset(offset).limit(pageSize).toArray()
  statusChangesCount.value = await db.houseStatusChanges.where('cid').equals(cid).count()
}

async function queryHouseTasks(pageIndex: number, pageSize: number) {
  houseTasks.value = await db.houseTasks.where('cid').equals(cid).offset(calcOffset(pageIndex, pageSize)).limit(pageSize).toArray()
  houseTasksCount.value = await db.houseTasks.where('cid').equals(cid).count()
}

async function queryRecords(pageIndex: number, pageSize: number) {
  records.value = await db.communityRecords.where('cid').equals(cid).reverse().offset(calcOffset(pageIndex, pageSize)).limit(pageSize).toArray()
  recordsCount.value = await db.communityRecords.where('cid').equals(cid).count()
}

function task2ObjectTableData(t: CommunityTask) {
  return {
    ...t,
    createdAt: new Date(t?.createdAt).toLocaleString(),
    lastRunningAt: new Date(t?.lastRunningAt).toLocaleString()
  }
}


onMounted(() => {
  queryData()
  // queryChanges(1,10)
})
</script>

<template>

  <div class="relative">

    <CommunityTitleHead v-if="task" :community="task" class="shadow my-10 px-3 py-4 rounded-lg"/>

    <FieldCardGroup v-if="task" :community="task" :last-record="records[0]" :at-before-last="records[1]?.at"/>


    <div>
      <div class="border p-2 rounded-lg sticky top-0 z-10 bg-white shadow">
        <DateRangePicker v-model:start-date="startDate" v-model:end-date="endDate"/>
      </div>

      <div class="c-block" id="changes-nav">
        <!-- changes history -->
        <h2> changes history </h2>
        <HouseChangesTable :data="changes ?? []" :row-count="changesCount ?? 0" @on-pagination-change="queryChanges"/>
      </div>

      <div class="c-block" id="status-changes-nav">
        <!-- changes history -->
        <h2> status changes history </h2>
        <HouseStatusChangesTimeline :data="statusChanges ?? []" :row-count="statusChangesCount ?? 0"
                                    @on-pagination-change="queryStatusChanges"/>
      </div>

    </div>


    <!-- graph -->
    <!-- house list -->
    <div class="c-block" id="houses-nav">
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

    <TocNav :items="[
    {id:'changes-nav',text:'价格变化'},
    {id:'status-changes-nav',text:'状态变化'},
    {id:'houses-nav',text:'房源列表'},
    ]"/>
  </div>

</template>

<style scoped>

</style>