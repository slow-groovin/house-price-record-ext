<script setup lang="ts">
//
import SelectSwitchButton from "@/components/custom/SelectSwitchButton.vue";
import { useExtTitle } from "@/composables/useExtInfo";
import { RentDao } from "@/entrypoints/db/rent-dao";
import GenericSortDock from "@/entrypoints/options/components/GenericSortDock.vue";
import HousePriceChangeQueryDock from "@/entrypoints/options/components/HousePriceChangeQueryDock.vue";
import RentHouseChangesTimeLine from "@/entrypoints/options/components/rent/RentHouseChangesTimeLine.vue";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import { frequentFieldZhMap, HouseChangeQueryCondition, SortState } from "@/types/query-condition";
import { RentHousePriceChange } from "@/types/rent";
import { ArgCache } from "@/utils/lib/ArgCache";
import { onMounted, ref } from "vue";

const { isDebug } = useDevSetting()

useExtTitle('价格变更')

const queryCondition = ref<HouseChangeQueryCondition>({})
const sortCondition = ref<SortState<RentHousePriceChange>>({})
const queryCost = ref(0)
const argCache = new ArgCache()
const isShowMultiColumn = ref(false)
const isShowDetail = ref(false)
/*
data
 */
const data = ref<RentHousePriceChange[]>([])
const rowCount = ref(0)

async function queryData(_pageIndex?: number, _pageSize?: number) {
  const pageIndex = argCache.retrieve('pageIndex', _pageIndex, 0)
  const pageSize = argCache.retrieve('pageSize', _pageSize, 20)
  const pageConditon = { pageIndex, pageSize }
  const beginAt = Date.now()



  const rs = await RentDao.from('ke').findManyChanges('price', pageConditon, queryCondition.value, sortCondition.value)
  data.value = rs.data
  rowCount.value = rs.count

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
  // await queryData()
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


  <RentHouseChangesTimeLine :data="data" :row-count="rowCount" :is-show-detail="isShowDetail"
    @on-pagination-change="queryData" :class="isShowMultiColumn ? 'flex-none grid grid-cols-3 grid-flow-row' : ''"
    type="price" />


</template>

<style scoped></style>