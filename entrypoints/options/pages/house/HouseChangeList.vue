<script setup lang="ts">
//
import {db} from "@/utils/client/Dexie";
import {HouseChange} from "@/types/lj";
import {calcOffset} from "@/utils/table-utils";
import {onMounted, ref} from "vue";
import HouseChangesTimeLine from "@/entrypoints/options/components/HouseChangesTimeLine.vue";
import HousePriceChangeQueryDock from "@/entrypoints/options/components/HousePriceChangeQueryDock.vue";
import {HouseChangeQueryCondition, SortState} from "@/types/query-condition";
import {ArgCache} from "@/utils/lib/ArgCache";
import {Collection, InsertType} from "dexie";
import {isNumber} from "radash";
import HouseTaskSortDock from "@/entrypoints/options/components/HouseTaskSortDock.vue";
import SelectButton from "@/components/custom/SelectButton.vue";
import SelectSwitchButton from "@/components/custom/SelectSwitchButton.vue";


const queryCondition = ref<HouseChangeQueryCondition>({})
const sortCondition=ref<SortState<HouseChange>>({})
const queryCost = ref(0)
const argCache = new ArgCache()
const isShowMultiColumn=ref(false)
const isShowDetail=ref(false)
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
  const {atMax, atMin, cidInclude, hidInclude, newValueMax, newValueMin, oldValueMax, oldValueMin,type} = queryCondition.value
  const {field, order} = sortCondition.value

  if(order && field){
    query=db.houseChanges.orderBy(field)
  }else  if (atMin || atMax) {
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
  }else{
    query=db.houseChanges.toCollection()
  }


  /**
   * filter
   */
  const filters:((item:HouseChange)=>boolean)[]=[]
  if(hidInclude){
    filters.push(item=>item.hid.includes(hidInclude))
  }
  if(cidInclude){
    filters.push(item=>item.cid.includes(cidInclude))
  }
  if(oldValueMin){
    filters.push(item=>item.oldValue>=oldValueMin)
  }
  if(oldValueMax){
    filters.push(item=>item.oldValue<=oldValueMax)
  }
  if(newValueMin){
    filters.push(item=>item.newValue>=newValueMin)
  }
  if(newValueMax){
    filters.push(item=>item.newValue<=newValueMax)
  }
  if(type==='increase'){
    filters.push(item=>item.newValue>item.oldValue)
  }
  if(type==='decrease'){
    filters.push(item=>item.newValue<item.oldValue)
  }

  //应用filter
  if(filters.length){
    query = query.filter(item=>filters.every(f=>f(item)))
  }




  rowCount.value = await query.count()

  if(order!=='asc'){
    query=query.reverse()
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
<pre>
  todo:
  1. param 接受cid, hid等参数, 便于c页面跳转查看详情
  2. c查询变为: 名字字符串(模糊)--> 找到cid  --> 索引查询
</pre>

  <div class="mb-5 rounded p-2 border">
    查询条件:
    <HousePriceChangeQueryDock v-model="queryCondition" @update="onApplyQueryCondition"/>
  </div>

  <div class="mb-5 rounded p-2 border">
    排序:
    <HouseTaskSortDock v-model="sortCondition"  :fields="['at','newValue']" @update="onApplyQueryCondition"/>
  </div>


  <div>{{ queryCondition }} {{sortCondition}}</div>

  <div class="flex items-center p-1 my-2 gap-4">
    <div>      共 {{rowCount}} 条    </div>
    <div>      查询耗时: {{ queryCost / 1000 }} 秒    </div>
    <SelectSwitchButton v-model="isShowMultiColumn">多行显示</SelectSwitchButton>
    <SelectSwitchButton v-model="isShowDetail">显示详细内容</SelectSwitchButton>
  </div>


  <HouseChangesTimeLine :data="data"
                        :row-count="rowCount"
                        :is-show-detail="isShowDetail"
                        @on-pagination-change="queryData"
                        :class="isShowMultiColumn?'flex-none grid grid-cols-3 grid-flow-row':''"
                        type="price"/>


</template>

<style scoped>

</style>