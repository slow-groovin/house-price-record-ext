<script setup lang="ts">
import {db} from "@/utils/client/Dexie";
import {HouseTask} from "@/types/lj";
import {calcOffset} from "@/utils/table-utils";
import HouseTasksTable from "@/entrypoints/options/components/HouseTasksTable.vue";
import {computed, onMounted, ref} from "vue";
import {RowSelectionState} from "@tanstack/vue-table";
import {Button} from "@/components/ui/button";
import {browser} from "wxt/browser";
import HouseTaskTableQueryDock from "@/entrypoints/options/components/HouseTaskTableQueryDock.vue";
import {HouseTaskQueryCondition, SortState} from "@/types/query-condition";
import {ArgCache} from "@/utils/lib/ArgCache";
import HouseTaskSortDock from "@/entrypoints/options/components/HouseTaskSortDock.vue";
import {Collection, InsertType} from "dexie";
import {isNumber} from "radash";
import {useRoute} from "vue-router";
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";

/*
ref definition
 */
const data = ref<HouseTask[]>([])
const rowCount = ref(0)

const rowSelection = ref<RowSelectionState>({})
const queryCache = new ArgCache()
const queryCost = ref(0)
const queryCondition = ref<HouseTaskQueryCondition>({})
const sortFields: (keyof HouseTask)[] = ['id', 'createdAt', 'totalPrice', 'lastRunningAt']
const sortCondition = ref<SortState<HouseTask>>({})
const selectionCount = computed(() => Object.keys(rowSelection.value).length)

const {query: {cid, name}} = useRoute()
if (cid && name) {
  queryCondition.value = {cidEqual: cid as string}
}
/*
ref definition DONE
 */

/*
data
 */
async function queryData(_pageIndex?: number, _pageSize?: number) {
  const beginAt = Date.now()

  const {
    addedType,
    cidInclude,
    cidEqual,
    city,
    createdAtMax,
    createdAtMin,
    hidInclude,
    status,
    totalPriceMax,
    totalPriceMin
  } = queryCondition.value
  const {field, order} = sortCondition.value
  const filters: ((task: HouseTask) => boolean)[] = []

  let whereKey = ''


  let query: Collection<HouseTask, number | undefined, InsertType<HouseTask, "id">>


  /**
   * indexDB中  where只能匹配一个单索引, 所以按照优先级选用某个字段匹配
   * 如果有排序, 则使用索引排序
   * 否则, 优先使用可能范围更小的的索引
   */
  if (order && field) {
    query = db.houseTasks.orderBy(field)
    if (order !== 'desc') {
      query = query.reverse()
    }
  } else if (cidEqual) {
    query = db.houseTasks.where('cid').equals(cidEqual)
  } else if (createdAtMax || createdAtMin) {
    if (!createdAtMin && createdAtMax) {
      query = db.houseTasks.where('createdAt').belowOrEqual(new Date(createdAtMax).getTime())
    } else if (!createdAtMax && createdAtMin) {
      query = db.houseTasks.where('createdAt').aboveOrEqual(new Date(createdAtMin).getTime())
    } else {
      query = db.houseTasks.where('createdAt').between(new Date(createdAtMin!).getTime(), new Date(createdAtMax!).getTime(), true, true)
    }
  } else if (isNumber(totalPriceMax) || isNumber(totalPriceMin)) {
    if (!isNumber(totalPriceMin)) {
      query = db.houseTasks.where('totalPrice').belowOrEqual(totalPriceMax)
    } else if (!isNumber(totalPriceMax)) {
      query = db.houseTasks.where('totalPrice').aboveOrEqual(totalPriceMin)
    } else {
      query = db.houseTasks.where('totalPrice').between(totalPriceMin, totalPriceMax, true, true)
    }
  } else if (status) {
    query = db.houseTasks.where('status').equals(status)
  } else if (city) {
    query = db.houseTasks.where('city').equals(city)
  } else {
    query = db.houseTasks.where('id').notEqual(-1)
  }


  /*
  字段匹配, 仅使用filter. 前面where匹配的index不做额外排除(减少代码复杂)
   */
  if (hidInclude) {
    filters.push(s => s.hid.includes(hidInclude))
  }
  if (cidInclude) {
    filters.push(s => s.cid.includes(cidInclude))
  }
  if (city) {
    filters.push(s => s.city.includes(city))
  }
  if (addedType) {
    filters.push(s => s.addedType === addedType)
  }
  if (totalPriceMin) {
    filters.push(s => s.totalPrice !== undefined && s.totalPrice >= totalPriceMin)
  }
  if (totalPriceMax) {
    filters.push(s => s.totalPrice !== undefined && s.totalPrice <= totalPriceMax)
  }
  if (createdAtMin) {
    filters.push(s => s.createdAt >= new Date(createdAtMin).getTime())
  }
  if (createdAtMax) {
    filters.push(s => s.createdAt <= new Date(createdAtMax).getTime())
  }
  if (cidEqual) {
    query = query.filter(s => s.cid === cidEqual)
  }
  if (status) {
    filters.push(s => s.status === status)
  }
  query = query.filter(t => filters.every(f => f(t)))


  rowCount.value = await query.count()


  const pageIndex = queryCache.retrieve('pageIndex', _pageIndex, 1)
  const pageSize = queryCache.retrieve('pageSize', _pageSize, 10)
  data.value = await query.offset(calcOffset(pageIndex, pageSize)).limit(pageSize).toArray()

  queryCost.value = Date.now() - beginAt
}

/*
data END
 */

async function onUpdateQueryCondition() {
  // console.log(queryCondition.value)
  queryCache.del('pageIndex') //重置pageIndex
  queryData()
}

async function goBeginBatchSelectedTasks() {
  const hidList = Object.keys(rowSelection.value)
    .map(s => Number(s))
    .map(i => data.value[i].hid)
  const id = await db.tempBatchHouse.add({hidList})

  const window = await browser.windows.getCurrent({})
  const newWindow = await browser.windows.create({state: 'maximized'})
  await chrome.sidePanel.open({windowId: newWindow.id as number})
  await chrome.sidePanel.setOptions({path: '/sidepanel.html#/h/batch?id=' + id})
}

async function goBeginAllSelectedTasks() {
  const hidList = Object.keys(rowSelection.value)
    .map(s => Number(s))
    .map(i => data.value[i].hid)
  const id = await db.tempBatchHouse.add({hidList})

  const window = await browser.windows.getCurrent({})
  const newWindow = await browser.windows.create({state: 'maximized'})
  await chrome.sidePanel.open({windowId: newWindow.id as number})
  await chrome.sidePanel.setOptions({path: '/sidepanel.html#/h/batch?id=' + id})
}

async function deleteSelectedTasks() {
  const ids = Object.keys(rowSelection.value).map(s => Number(s)).map(index => data.value[index].id)
  await db.houseTasks.bulkDelete(ids)
  alert(`删除成功!${ids.length}个任务`)
  data.value = data.value.filter(item => !ids.includes(item.id))
  rowSelection.value = {}
}

onMounted(() => {
})

</script>

<template>
  <h1 class="text-2xl mx-2 my-4 font-bold">房源任务</h1>

  <div class="border rounded-lg p-2">
    <h2 class="mb-3 mx-2">查询条件:</h2>
    <HouseTaskTableQueryDock v-model="queryCondition" @update="onUpdateQueryCondition"/>
  </div>
  <div class="flex items-center p-2 gap-4 border rounded">
    <span>排序:</span>
    <HouseTaskSortDock :fields="sortFields" v-model="sortCondition" @update="onUpdateQueryCondition"/>
  </div>


  <div class="flex border rounded">
    <span class="border rounded mr-2">Debug</span>
    {{ queryCondition }} {{ sortCondition }}
  </div>
  <div class="flex gap-4">
    <div>共 <span class="text-primary">{{ rowCount }}</span> 个</div>
    <div>查询耗时: <span class="text-primary">{{ queryCost / 1000 }}</span> 秒</div>
    <div v-if="rowSelection">选中 <span class="text-primary"> {{ selectionCount }}</span> 个</div>

    <ConfirmDialog @confirm="goBeginBatchSelectedTasks">
      <template #trigger>
        <Button class="p-1 h-fit">开始运行(选中)</Button>
      </template>
      开始运行 {{ selectionCount }} 个任务?
    </ConfirmDialog>


    <ConfirmDialog @confirm="deleteSelectedTasks">
      <template #trigger>
        <Button variant="destructive" class="p-1 h-fit">删除(选中)</Button>
      </template>
      <span class="text-red-700 font-bold">
        确认要删除选中的 {{ selectionCount }} 个任务吗?
      </span>
    </ConfirmDialog>

  </div>

  <div class="overflow-x-auto">
    <HouseTasksTable :data="data" :row-count="rowCount" @on-pagination-change="queryData"
                     v-model:row-selection="rowSelection"/>

  </div>


</template>

<style scoped>

</style>