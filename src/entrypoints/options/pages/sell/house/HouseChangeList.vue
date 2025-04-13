<script setup lang="ts">
//
import { db } from "@/entrypoints/db/Dexie";
import { HouseChange } from "@/types/lj";
import { calcOffset } from "@/utils/table-utils";
import { onMounted, ref } from "vue";
import HouseChangesTimeLine from "@/entrypoints/options/components/sell/HouseChangesTimeLine.vue";
import HousePriceChangeQueryDock from "@/entrypoints/options/components/HousePriceChangeQueryDock.vue";
import { frequentFieldZhMap, HouseChangeQueryCondition, SortState } from "@/types/query-condition";
import { ArgCache } from "@/utils/lib/ArgCache";
import { Collection, InsertType } from "dexie";
import { isNumber } from "radash";
import GenericSortDock from "@/entrypoints/options/components/GenericSortDock.vue";
import SelectSwitchButton from "@/components/custom/SelectSwitchButton.vue";
import { useExtTitle } from "@/composables/useExtInfo";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";

const { isDebug } = useDevSetting()

useExtTitle('价钱变更')

const queryCondition = ref<HouseChangeQueryCondition>({})
const sortCondition = ref<SortState<HouseChange>>({})
const queryCost = ref(0)
const argCache = new ArgCache()
const isShowMultiColumn = ref(false)
const isShowDetail = ref(false)
/*
data
 */
const data = ref<HouseChange[]>([])
const rowCount = ref(0)

async function queryData(_pageIndex?: number, _pageSize?: number) {
  const pageIndex = argCache.retrieve('pageIndex', _pageIndex, 0)
  const pageSize = argCache.retrieve('pageSize', _pageSize, 20)
  const beginAt = Date.now()

  let query: Collection<HouseChange, number | undefined, InsertType<HouseChange, "id">>

  /**
   * index match
   */
  const { atMax, atMin, cidInclude, hidInclude, newValueMax, newValueMin, oldValueMax, oldValueMin, type } = queryCondition.value
  const { field, order } = sortCondition.value

  if (order && field) {
    query = db.houseChanges.orderBy(field)
  } else if (atMin || atMax) {
    if (atMin && atMax) {
      query = db.houseChanges.where('at').between(new Date(atMin).getTime(), new Date(atMax).getTime(), true, true)
    } else if (atMin) {
      query = db.houseChanges.where('at').aboveOrEqual(new Date(atMin).getTime())
    } else {
      query = db.houseChanges.where('at').belowOrEqual(new Date(atMax!).getTime())
    }
  } else if (isNumber(newValueMin) || isNumber(newValueMax)) {
    if (!isNumber(newValueMin)) {
      query = db.houseChanges.where('newValue').belowOrEqual(newValueMax)
    } else if (!isNumber(newValueMax)) {
      query = db.houseChanges.where('newValue').aboveOrEqual(newValueMin)
    } else {
      query = db.houseChanges.where('newValue').between(newValueMin, newValueMax, true, true)
    }
  } else {
    query = db.houseChanges.toCollection()
  }


  /**
   * filter
   */
  const filters: ((item: HouseChange) => boolean)[] = []
  if (hidInclude) {
    filters.push(item => item.hid.includes(hidInclude))
  }
  if (cidInclude) {
    filters.push(item => item.cid.includes(cidInclude))
  }
  if (oldValueMin) {
    filters.push(item => item.oldValue >= oldValueMin)
  }
  if (oldValueMax) {
    filters.push(item => item.oldValue <= oldValueMax)
  }
  if (newValueMin) {
    filters.push(item => item.newValue >= newValueMin)
  }
  if (newValueMax) {
    filters.push(item => item.newValue <= newValueMax)
  }
  if (type === 'increase') {
    filters.push(item => item.newValue > item.oldValue)
  }
  if (type === 'decrease') {
    filters.push(item => item.newValue < item.oldValue)
  }

  //应用filter
  if (filters.length) {
    query = query.filter(item => filters.every(f => f(item)))
  }




  rowCount.value = await query.count()

  if (order !== 'asc') {
    query = query.reverse()
  }

  data.value = await query
    .offset(calcOffset(pageIndex, pageSize))
    .limit(pageSize)
    .toArray()

  queryCost.value = Date.now() - beginAt
}

/*
data END
 */


function onApplyQueryCondition() {
  argCache.del('pageIndex')
  queryData()
}

onMounted(async () => {
  await queryData()
})


</script>

<template>
  <h1 class="text-2xl font-bold text-center my-4">价格变动</h1>
  <div class="mb-5 rounded p-2 border">
    查询条件:
    <HousePriceChangeQueryDock v-model="queryCondition" @update="onApplyQueryCondition" />
  </div>

  <div class="mb-5 rounded p-2 border">
    排序:
    <GenericSortDock v-model="sortCondition" :fields="['at', 'newValue']" :field-text-map="frequentFieldZhMap"
      @update="onApplyQueryCondition" />
  </div>


  <div v-if="isDebug">{{ queryCondition }} {{ sortCondition }}</div>

  <div class="flex items-center p-1 my-2 gap-4">
    <div> 共 {{ rowCount }} 条 </div>
    <div> 查询耗时: {{ queryCost / 1000 }} 秒 </div>
    <SelectSwitchButton v-model="isShowMultiColumn">多行显示</SelectSwitchButton>
    <SelectSwitchButton v-model="isShowDetail">显示详细内容</SelectSwitchButton>
  </div>


  <HouseChangesTimeLine :data="data" :row-count="rowCount" :is-show-detail="isShowDetail"
    @on-pagination-change="queryData" :class="isShowMultiColumn ? 'flex-none grid grid-cols-3 grid-flow-row' : ''"
    type="price" />


</template>

<style scoped></style>