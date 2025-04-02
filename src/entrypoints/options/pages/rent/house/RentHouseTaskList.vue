<script setup lang="ts">
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";
import { Button } from "@/components/ui/button";
import { useExtTitle } from "@/composables/useExtInfo";
import { useRouterQuery } from "@/composables/useRouterQuery";
import { db } from "@/entrypoints/db/Dexie";
import { KeRentDao } from "@/entrypoints/db/rent-dao";
import GenericSortDock from "@/entrypoints/options/components/GenericSortDock.vue";
import RentHouseTasksTable from "@/entrypoints/options/components/rent/RentHouseTasksTable.vue";
import HouseTaskTableQueryDock from "@/entrypoints/options/components/sell/HouseTaskTableQueryDock.vue";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import { goRunHouseTasksStartPage } from "@/entrypoints/reuse/house-control2";
import { newQueryConditionFromQueryParam } from "@/entrypoints/reuse/query-condition";
import { HouseTaskStatus } from "@/types/lj";
import {
  frequentFieldZhMap,
  houseQueryConditionTemplate,
  HouseTaskQueryCondition,
  SortState
} from "@/types/query-condition";
import { RentHouse } from "@/types/rent";
import { ArgCache } from "@/utils/lib/ArgCache";
import { mergeParams } from "@/utils/variable";
import { RowSelectionState } from "@tanstack/vue-table";
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
const { isDebug } = useDevSetting()

useExtTitle('租房房源任务列表')

/*
route handle BEGIN
 */
const { pushQuery, removeQuery, pushQueries, removeQueries } = useRouterQuery()
const { query } = useRoute()
const { _pageIndex, queryPageSize } = query
const _pageSize = mergeParams(queryPageSize, localStorage.getItem('rent-house-list-page-size'))

const queryScopeLabel = ref('')

/*
route handle END
 */

/*
const BEGIN
 */
const queryCondTemplate: HouseTaskQueryCondition = {
  addedType: 0, cidEqual: "", cidInclude: "", city: "", createdAtMax: "", createdAtMin: "", groupId: 0, hidInclude: "",
  status: HouseTaskStatus.running, totalPriceMax: 0, totalPriceMin: 0
}
/*
const END
 */

/*
ref definition
 */
const data = ref<RentHouse[]>([])
const rowCount = ref(0)

const queryCondition = ref<HouseTaskQueryCondition>(newQueryConditionFromQueryParam(houseQueryConditionTemplate, query))

if (query.groupId) {
  queryScopeLabel.value = `分组:[${query.groupId}]`
} else if (query.cidEqual) {
  queryScopeLabel.value = `小区: [${query.cidEqual}]`
}


const rowSelection = ref<RowSelectionState>({})
const queryCache = new ArgCache()
const queryCost = ref(0)

const sortFields: (keyof RentHouse)[] = ['rid', 'price', 'createdAt', 'lastRunningAt', 'releasedAt',]

const sortCondition = ref<SortState<RentHouse>>({})
const selectionCount = computed(() => Object.keys(rowSelection.value).length)

const groupForAdd = ref<{ groupId: number, name: string }>()


/*
ref definition DONE
 */

/*
data
 */
async function queryData(_pageIndex?: number, _pageSize?: number) {
  rowSelection.value = {}
  const beginAt = Date.now()

  const pageIndex = queryCache.retrieve('pageIndex', _pageIndex, 1)
  const pageSize = queryCache.retrieve('pageSize', _pageSize, 10)
  const pagiCond = { pageIndex, pageSize }
  const queryRs = await KeRentDao().findManyHouses(pagiCond, queryCondition.value, sortCondition.value)
  data.value = queryRs.data

  rowCount.value = queryRs.count

  queryCost.value = Date.now() - beginAt
}

/*
data END
 */
/**更新分页*/
async function onPaginationUpdate(pageIndex: number, pageSize: number) {
  await pushQuery('_pageIndex', pageIndex)
  await pushQuery('_pageSize', pageSize)
  localStorage.setItem('rent-house-list-page-size', pageSize + '')
  await queryData(pageIndex, pageSize)
}

/**更新查询条件*/
async function onUpdateQueryCondition() {
  await removeQueryConditionQueryParam()
  const condition = queryCondition.value
  await pushQueries(condition)

  // queryCache.del('pageIndex') //重置pageIndex
  // await removeQuery('_pageIndex')
  await queryData()
}


async function removeQueryConditionQueryParam() {
  await removeQueries(Object.keys(queryCondTemplate))
}


async function deleteSelectedTasks() {
  const ids = Object.keys(rowSelection.value).map(s => Number(s)).filter(index => data.value[index]?.rid).map(index => data.value[index].rid)
  await KeRentDao().deleteHouses(ids)
  alert(`删除成功!${ids.length}个任务`)
  data.value = data.value.filter(item => !ids.includes(item.rid))
  rowSelection.value = {}
}


onMounted(() => {
})

</script>

<template>
  <h1 class="text-2xl mx-2 my-4 font-bold">租房房源任务<span v-if="queryScopeLabel">({{ queryScopeLabel }})</span></h1>
  <div class="border rounded-lg p-2">
    <h2 class="mb-3 mx-2">查询条件:</h2>
    <HouseTaskTableQueryDock v-if="queryCondition" v-model="queryCondition" @update="onUpdateQueryCondition"
      type="rent" />
  </div>
  <div class="flex items-center p-2 gap-4 border rounded my-2">
    <span>排序:</span>
    <GenericSortDock :fields="sortFields" v-model="sortCondition" :field-text-map="frequentFieldZhMap"
      @update="onUpdateQueryCondition" />
  </div>


  <div class="flex border rounded" v-if="isDebug">
    <span class="border rounded mr-2">Debug</span>
    {{ queryCondition }} {{ sortCondition }}
  </div>
  <div class="flex gap-4  mb-4">
    <div>共 <span class="text-primary">{{ rowCount }}</span> 个</div>
    <div>查询耗时: <span class="text-primary">{{ queryCost / 1000 }}</span> 秒</div>
    <div v-if="rowSelection">选中 <span class="text-primary"> {{ selectionCount }}</span> 个</div>



    <ConfirmDialog @confirm="deleteSelectedTasks">
      <template #trigger>
        <Button variant="destructive" class="p-1 h-fit" :disabled="!selectionCount">删除(选中)</Button>
      </template>
      <span class="text-red-700 font-bold">
        确认要删除选中的 {{ selectionCount }} 个任务吗?
      </span>
    </ConfirmDialog>



  </div>

  <RentHouseTasksTable :data="data" :row-count="rowCount" :init-page-index="_pageIndex ? Number(_pageIndex) : undefined"
    :init-page-size="_pageSize ? Number(_pageSize) : undefined" @on-pagination-change="onPaginationUpdate"
    class="overflow-x-hidden" v-model:row-selection="rowSelection" />

</template>

<style scoped></style>