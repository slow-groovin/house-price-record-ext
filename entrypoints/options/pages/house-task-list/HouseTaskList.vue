<script setup lang="ts">
import {db} from "@/utils/client/Dexie";
import {HouseTask} from "@/types/lj";
import {calcOffset} from "@/utils/table-utils";
import HouseTasksTable from "@/entrypoints/options/components/HouseTasksTable.vue";
import {onMounted, ref} from "vue";
import {RowSelectionState} from "@tanstack/vue-table";
import {Button} from "@/components/ui/button";
import {browser} from "wxt/browser";
import {sendMessage} from "webext-bridge/popup";
import HouseTaskTableQueryDock from "@/entrypoints/options/components/HouseTaskTableQueryDock.vue";
import {HouseTaskQueryCondition, SortState} from "@/types/query-condition";
import {ArgCache} from "@/utils/lib/ArgCache";
import HouseTaskSortDock from "@/entrypoints/options/components/HouseTaskSortDock.vue";

/*
ref definition
 */
const data = ref<HouseTask[]>([])
const rowCount=ref(0)

const rowSelection=ref<RowSelectionState>({})
const queryCache=new ArgCache()
const queryCost=ref(0)
const queryCondition=ref<HouseTaskQueryCondition>({})
const sortFields:(keyof HouseTask)[]=['id','createdAt','totalPrice','lastRunningAt']
const sortCondition=ref<SortState<HouseTask>>({})

/*
ref definition DONE
 */

/*
data
 */
async function queryData(_pageIndex?:number,_pageSize?:number) {
  const beginAt=Date.now()

  const {addedType,cidInclude,city,createdAtMax,createdAtMin,hidInclude,status,totalPriceMax,totalPriceMin}=queryCondition.value
  const {field,order}=sortCondition.value
  const filters:((task:HouseTask)=>boolean)[]=[]

  let query
  if(!order){
    query=db.houseTasks.toCollection()
  }else{
    query=db.houseTasks.orderBy(field!)
    if(order==='desc'){
      query=query.reverse()
    }
  }





  if(hidInclude){
    filters.push(s=>s.hid.includes(hidInclude))
  }
  if(cidInclude){
    filters.push(s=>s.cid.includes(cidInclude))
  }
  if(city){
    filters.push(s=>s.city.includes(city))
  }
  if(status){
    filters.push(s=>s.status===status)
  }
  if(addedType){
    filters.push(s=>s.addedType===addedType)
  }
  if(totalPriceMin){
    filters.push(s=>s.totalPrice!==undefined && s.totalPrice>=totalPriceMin)
  }
  if(totalPriceMax){
    filters.push(s=>s.totalPrice!==undefined && s.totalPrice<=totalPriceMax)
  }
  if(createdAtMin){
    filters.push(s=>s.createdAt>=new Date(createdAtMin).getTime())
  }
  if(createdAtMax){
    filters.push(s=>s.createdAt<=new Date(createdAtMax).getTime())
  }


  query=query.filter(t=>filters.every(f=>f(t)))


  rowCount.value = await query.count()

  const pageIndex=queryCache.retrieve('pageIndex',_pageIndex,1)
  const pageSize=queryCache.retrieve('pageSize',_pageSize,10)
  data.value = await query.offset(calcOffset(pageIndex, pageSize)).limit(pageSize).toArray()

  queryCost.value=Date.now()-beginAt
}
/*
data END
 */

async function onUpdateQueryCondition(){
  // console.log(queryCondition.value)
  queryCache.del('pageIndex') //重置pageIndex
  queryData()
}

async function batchCrawl2(){
  const hidList=Object.keys(rowSelection.value)
    .map(s=>Number(s))
    .map(i=>data.value[i].hid)
  const id=await db.tempBatchHouse.add({hidList})

  const window=await browser.windows.getCurrent({})
  const newWindow=await browser.windows.create({state:'maximized'})
  await chrome.sidePanel.open({windowId: newWindow.id as number})
  await chrome.sidePanel.setOptions({path:'/sidepanel.html#/h/batch?id='+id})

}

async function sendMessageTest(){
  const rs=await sendMessage('sidebarStartBatchHouse', {hidList:['1','222',]},'popup')

}


onMounted(()=>{
})

</script>

<template>
  <div class="c-block">
    <h1>actions</h1>
    <div class="flex flex-row flex-wrap">

    </div>
    <Button @click="batchCrawl2()">batchCrawl2</Button>
  </div>

  <div class="border rounded-lg p-2">
    <h2 class="mb-3 mx-2">查询条件:</h2>
    <HouseTaskTableQueryDock v-model="queryCondition" @update="onUpdateQueryCondition"/>
  </div>
  <div class="flex items-center p-2 gap-4 border rounded">
    <span>排序:</span>
    <HouseTaskSortDock :fields="sortFields" v-model="sortCondition" @update="onUpdateQueryCondition"/>
  </div>


  <div class="flex">
    {{queryCondition}}
    <div>共 {{rowCount}} 个</div>
    <div>查询耗时:  {{queryCost/1000}} 秒</div>
  </div>

  <HouseTasksTable :data="data" :row-count="rowCount" @on-pagination-change="queryData" v-model:row-selection="rowSelection"/>

</template>

<style scoped>

</style>