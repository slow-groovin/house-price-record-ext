<script setup lang="ts">
import DateRangePicker from "@/components/DateRangePicker.vue";
import TocNav from "@/components/float/TocNav.vue";
import RentCommunityTitleHead from "@/components/lj/community/detail/RentCommunityTitleHead.vue";
import RentFieldCardGroup from "@/components/lj/community/detail/RentFieldCardGroup.vue";
import { useExtTitle } from "@/composables/useExtInfo";
import { KeRentDao } from "@/entrypoints/db/rent-dao";
import RentCommunityRecordGraphs from "@/entrypoints/options/components/rent/RentCommunityRecordGraphs.vue";
import RentCommunityRecordTable from "@/entrypoints/options/components/rent/RentCommunityRecordTable.vue";
import RentHouseChangesTimeLine from "@/entrypoints/options/components/rent/RentHouseChangesTimeLine.vue";
import { RentCommunityRecord, RentCommunityTask, RentHouse, RentHousePriceChange, RentHouseStatusChange } from "@/types/rent";
import { calendarDateToDate } from "@/utils/date";
import { ArgCache } from "@/utils/lib/ArgCache";
import { CalendarDate } from "@internationalized/date";
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";

const { query } = useRoute()
const cid = query['id'] as string


const today = new Date()
const startDate = ref<CalendarDate>()
const endDate = ref<CalendarDate>()

endDate.value = new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
startDate.value = endDate.value.subtract({ years: 1 })

const startDateTimestamp = () => calendarDateToDate(startDate.value)?.getTime() ?? Infinity
const endDateTimestamp = () => (calendarDateToDate(endDate.value)?.getTime() ?? -Infinity) + 24 * 60 * 60 * 1000 - 1  //当天的结尾

const task = ref<RentCommunityTask>()

const records = ref<RentCommunityRecord[]>([])
const recordsCount = ref(0)


const changes = ref<RentHousePriceChange[]>([])
const changesCount = ref(0)

const statusChanges = ref<RentHouseStatusChange[]>([])
const statusChangesCount = ref(0)

const argCache = new ArgCache()

useExtTitle(() => '任务详情:' + task.value?.name)


async function resetDateRange() {
  queryChanges()
  queryStatusChanges()
  queryRecords()
}

async function queryData() {
  task.value = await KeRentDao().findFirstCommunityByCid(cid)
}

async function queryChanges(_pageIndex?: number, _pageSize?: number) {
  const pageIndex = _pageIndex ?? 1
  const pageSize = argCache.retrieve('queryChanges-pageSize', _pageSize, 10)
  const pagination = { pageIndex, pageSize }

  const rs = await KeRentDao().findManyChanges('price', pagination, {
    cidEqual: cid,
    atMin: new Date(startDateTimestamp()).toString(),
    atMax: new Date(endDateTimestamp()).toString(),
  })
  changesCount.value = rs.count
  changes.value = rs.data

  console.log(_pageIndex, _pageSize, changes.value, changesCount.value)
}

async function queryStatusChanges(_pageIndex?: number, _pageSize?: number) {

  const pageIndex = _pageIndex ?? 1
  const pageSize = argCache.retrieve('queryStatusChanges-pageSize', _pageSize, 10)
  const pagination = { pageIndex, pageSize }
  const rs = await KeRentDao().findManyChanges('status', pagination, {
    cidEqual: cid,
    atMin: new Date(startDateTimestamp()).toString(),
    atMax: new Date(endDateTimestamp()).toString(),
  })
  statusChangesCount.value = rs.count
  statusChanges.value = rs.data
}



async function queryRecords(_pageIndex?: number, _pageSize?: number) {
  const pageIndex = _pageIndex ?? 1
  const pageSize = argCache.retrieve('queryStatusChanges-pageSize', _pageSize, 10)
  const pagination = { pageIndex, pageSize }

  const rs = await KeRentDao().findManyRecords(pagination, {
    cidEqual: cid,
    atMin: startDateTimestamp(),
    atMax: endDateTimestamp()
  });

  recordsCount.value = rs.count
  records.value = rs.data
}


onMounted(() => {
  queryData()
  // queryChanges(1,10)
})
</script>

<template>

  <div class="relative">

    <RentCommunityTitleHead id="basic-nav" v-if="task" :community="task" class="shadow my-10 px-3 py-4 rounded-lg" />


    <RentFieldCardGroup v-if="task" :community="task" :last-record="records[0]" :at-before-last="records[1]?.at"
      class="mb-8" />


    <!-- house list -->
    <div id="houses-nav" v-if="task?.cid && task?.name" class="my-8 border-b ">
      <h2 class="border-b my-8">房源列表</h2>
      <div class="p-8 mx-auto w-fit text-xl">
        <a :href="`/options.html#/rent/h/task/list?cidEqual=${task.cid}&name=${task.name}`" target="_blank"
          class="link my-8 font-bold">去列表页查看</a>
      </div>

    </div>

    <div class="relative  flex flex-col gap-4">
      <div class="border-b w-fit p-2 rounded-lg sticky top-0 z-10 bg-white shadow">
        <DateRangePicker v-model:start-date="startDate" v-model:end-date="endDate" @confirm="resetDateRange" />
      </div>

      <div id="changes-nav" class="flex flex-wrap gap-16">
        <div class="border-b p-2 px-8 rounded w-fit ">
          <!-- changes history -->
          <h2>价格变动历史</h2>
          <RentHouseChangesTimeLine :data="changes ?? []" :row-count="changesCount ?? 0" type="price"
            @on-pagination-change="queryChanges" />
        </div>

        <div class="border-b p-2 px-8 rounded w-fit">
          <!-- changes history -->
          <h2>状态变动历史</h2>
          <RentHouseChangesTimeLine :data="statusChanges ?? []" :row-count="statusChangesCount ?? 0" type="status"
            @on-pagination-change="queryStatusChanges" />
        </div>
      </div>

      <div id="records-nav" class="p-2 border-b">
        <h2 class=" ">运行历史</h2>
        <RentCommunityRecordTable :data="records" :row-count="recordsCount" @on-pagination-change="queryRecords" />
      </div>

      <div id="charts-nav" class="p-2  border-b">
        <h2 class=" "> 数据图表</h2>
        <RentCommunityRecordGraphs :data="records" />
      </div>
    </div>


    <!-- graph -->









    <TocNav :items="[
      { id: 'basic-nav', text: '基本信息' },
      { id: 'changes-nav', text: '变更记录' },
      { id: 'records-nav', text: '运行记录' },
      { id: 'charts-nav', text: '数据图表' },
      { id: 'houses-nav', text: '房源列表' },

    ]" />
  </div>

</template>

<style scoped lang="postcss">
h2 {
  @apply text-lg font-bold border-b mb-2
}

div {
  scroll-margin-top: 4rem;
}
</style>