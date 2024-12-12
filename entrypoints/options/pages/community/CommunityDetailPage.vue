<script setup lang="ts">
import {useRoute} from "vue-router";
import {db} from "@/utils/client/Dexie";
import {CommunityRecord, CommunityTask, HouseChange, HouseStatusChange, HouseTask} from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import {calcOffset} from "@/utils/table-utils";
import HouseTasksTable from "@/entrypoints/options/components/HouseTasksTable.vue";
import CommunityRecordTable from "@/entrypoints/options/components/CommunityRecordTable.vue";
import {onMounted, ref, toRaw} from "vue";
import CommunityTitleHead from "@/components/lj/community/detail/CommunityTitleHead.vue";
import FieldCardGroup from "@/components/lj/community/detail/FieldCardGroup.vue";
import TocNav from "@/components/float/TocNav.vue";
import DateRangePicker from "@/components/DateRangePicker.vue";
import {CalendarDate} from "@internationalized/date";
import {calendarDateToDate} from "@/utils/date";
import {ArgCache} from "@/utils/lib/ArgCache";
import HouseChangesTimeLine from "@/entrypoints/options/components/HouseChangesTimeLine.vue";
import CommunityRecordGraphs from "@/entrypoints/options/components/CommunityRecordGraphs.vue";

const {query} = useRoute()
const cid = query['id'] as string


const today = new Date()
const startDate = ref<CalendarDate>()
const endDate = ref<CalendarDate>()

endDate.value = new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
startDate.value = endDate.value.subtract({years: 1})

const startDateTimestamp = () => calendarDateToDate(startDate.value)?.getTime()??Infinity
const endDateTimestamp = () => (calendarDateToDate(endDate.value)?.getTime()??-Infinity) + 24 * 60 * 60 * 1000 - 1  //当天的结尾

const task = ref<CommunityTask>()

const records = ref<CommunityRecord[]>([])
const recordsCount = ref(0)

const houseTasks = ref<HouseTask[]>([])
const houseTasksCount = ref(0)

const changes = ref<HouseChange[]>([])
const changesCount = ref(0)

const statusChanges = ref<HouseStatusChange[]>([])
const statusChangesCount = ref(0)

const argCache=new ArgCache()

async function resetDateRange(){
  queryChanges()
  queryStatusChanges()
  queryRecords()
  console.log(endDateTimestamp())
}

async function queryData() {
  task.value = await db.communityTasks.where('cid').equals(cid).first()
  records.value = await db.communityRecords.where('cid').equals(cid).toArray()
  let accessRecord = toRaw(task.value?.accessRecord);
  console.log('task:', toRaw(task.value), accessRecord)
  console.log('records:', toRaw(records.value))
  console.log('accessRecord?.startDate:', accessRecord?.startDate, typeof accessRecord?.startDate)
}

async function queryChanges(_pageIndex?: number, _pageSize?: number) {
  const pageIndex=_pageIndex??1
  const pageSize=argCache.retrieve('queryChanges-pageSize',_pageSize,10)

  const offset = calcOffset(pageIndex, pageSize)
  const query=db.houseChanges.where({'cid': cid})
    .and((c) => c.at >= startDateTimestamp() && c.at <= endDateTimestamp())

  changesCount.value = await query.count()  //这一步一定要在最前面, 会被后面的offset() limit()影响
  changes.value = await query.reverse().offset(offset).limit(pageSize).toArray()

  console.log(_pageIndex,_pageSize, changes.value,changesCount.value)
}

async function queryStatusChanges(_pageIndex?: number, _pageSize?: number) {
  const pageIndex=_pageIndex??1
  const pageSize=argCache.retrieve('queryStatusChanges-pageSize',_pageSize,10)
  const offset = calcOffset(pageIndex, pageSize)
  const query= db.houseStatusChanges.where({'cid': cid}).and((c) => c.at >= startDateTimestamp() && c.at <= endDateTimestamp())
  statusChangesCount.value = await query.count()
  statusChanges.value = await query.reverse().offset(offset).limit(pageSize).toArray()
}

async function queryHouseTasks(pageIndex: number, pageSize: number) {
  houseTasks.value = await db.houseTasks.where('cid').equals(cid).offset(calcOffset(pageIndex, pageSize)).limit(pageSize).toArray()
  houseTasksCount.value = await db.houseTasks.where('cid').equals(cid).count()
}

async function queryRecords(_pageIndex?: number, _pageSize?: number) {
  const pageIndex=_pageIndex??1
  const pageSize=argCache.retrieve('queryStatusChanges-pageSize',_pageSize,10)
  const offset = calcOffset(pageIndex, pageSize)
  const query= db.communityRecords.where({'cid': cid}).and((c) => c.at >= startDateTimestamp() && c.at <= endDateTimestamp())
  recordsCount.value = await query.count()

  records.value = await query.reverse().offset(offset).limit(pageSize).toArray()
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

  <div class="relative" >

    <CommunityTitleHead v-if="task" :community="task" class="shadow my-10 px-3 py-4 rounded-lg"/>

    <FieldCardGroup v-if="task" :community="task" :last-record="records[0]" :at-before-last="records[1]?.at"/>


    <div class="flex flex-col gap-4">
      <div class="border p-2 rounded-lg sticky top-0 z-10 bg-white shadow">
        <DateRangePicker v-model:start-date="startDate" v-model:end-date="endDate" @confirm="resetDateRange"/>
      </div>

      <div class="flex flex-wrap gap-6" >
        <div class="border p-2 rounded w-fit" id="changes-nav">
          <!-- changes history -->
          <h1 class="font-bold text-2xl text-center">价格变动历史</h1>
          <HouseChangesTimeLine :data="changes ?? []" :row-count="changesCount ?? 0" type="price"  @on-pagination-change="queryChanges"/>
        </div>

        <div class="border p-2 rounded w-fit" id="changes-nav">
          <!-- changes history -->
          <h1 class="font-bold text-2xl text-center">状态变动历史</h1>
          <HouseChangesTimeLine :data="statusChanges ?? []" :row-count="statusChangesCount ?? 0" type="status"  @on-pagination-change="queryStatusChanges"/>
        </div>



      </div>

      <div class="p-2 border">
        <h2 class="text-center text-2xl">community record</h2>
        <CommunityRecordTable :data="records" :row-count="recordsCount" @on-pagination-change="queryRecords"/>
      </div>

      <div class="p-2 border">
        <h2 class="text-2xl text-center"> records graph</h2>
        <CommunityRecordGraphs :data="records"/>
      </div>
    </div>


    <!-- graph -->
    <!-- house list -->
    <div class="" id="houses-nav" v-if="task?.cid && task?.name">
      <h2>house list</h2>

      <a :href="`/options.html#/h/task/list?cid=${task.cid}&name=${task.name}`" target="_blank" class="link" >去查看</a>
    </div>

    <div class=" w-fit">
      <h2>历史运行记录</h2>
      <CalendarGraph v-if="task?.accessRecord" :access-record="AccessRecord.fromAccessRecord(task?.accessRecord)"/>
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