<script setup lang="ts">
import {db} from "@/utils/client/Dexie";
import {HouseTask} from "@/types/lj";
import {calcOffset} from "@/utils/table-utils";
import HouseTasksTable from "@/entrypoints/options/components/HouseTasksTable.vue";
import {onMounted, ref} from "vue";
import { RowSelectionState} from "@tanstack/vue-table";
import {Button} from "@/components/ui/button";
import {runHouseTaskManualRunCrawlOne} from "@/entrypoints/reuse/house-control";
import {BatchQueueExecutor, Job} from "@/utils/lib/BatchQueueExecutor";
import {browser} from "wxt/browser";
import BatchJobRunningStatusBar from "@/components/lj/BatchJobRunningStatusBar.vue";

/*
ref definition
 */
const data = ref<HouseTask[]>([])
const rowCount=ref(0)

const rowSelection=ref<RowSelectionState>({})
/*
ref definition DONE
 */

/*
data
 */
async function queryData(pageIndex:number,pageSize:number) {
  data.value = await db.houseTasks.offset(calcOffset(pageIndex, pageSize)).limit(pageSize).toArray()
  rowCount.value = await db.houseTasks.count()
}
/*
data END
 */

/**
 * 批量开启任务
 */
const batchExecutor=ref<BatchQueueExecutor>()
const batchSize=ref(0)
async function batchCrawl(){
  await browser.windows.create({})
  batchSize.value=Object.keys(rowSelection.value).length
  function * jobIter():IterableIterator<Job> {
    const hidList=Object.keys(rowSelection.value)
      .map(s=>Number(s))
      .map(i=>data.value[i].hid)

    for (let hid of hidList) {
      yield {
        promiseGetter: ()=>runHouseTaskManualRunCrawlOne(hid),
        context: {
          id: hid,
        }
      }
    }
  }
  batchExecutor.value=new BatchQueueExecutor(jobIter(),{
    retryTimes:0,
    interval:500,
    maxConcurrent:5,
    log:true,
        onJobFailHook:context=>{
      console.log('job fail',context)
    },
    onJobRetryHook:context=>{
      console.log('job retry',context)
    },
        onFinishedHook:()=>{
      console.log('finished')
    },
    onPauseHook:context=>{
      console.log('pause',context)
    }
  })
  await batchExecutor.value.run()
  alert("all done.")

}
onMounted(()=>{
})
</script>

<template>
  <div class="c-block">
    <h1>actions</h1>
    <div class="flex flex-row flex-wrap">

    </div>
    <Button @click="batchCrawl()">batchCrawl</Button>
    <BatchJobRunningStatusBar v-if="batchExecutor" :executor="batchExecutor" :total="batchSize"/>
  </div>
  <HouseTasksTable :data="data" :row-count="rowCount" @on-pagination-change="queryData" v-model:row-selection="rowSelection"/>

</template>

<style scoped>

</style>