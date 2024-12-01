<script setup lang="ts">
import {db} from "@/utils/client/Dexie";
import {HouseTask} from "@/types/lj";
import {calcOffset} from "@/utils/table-utils";
import HouseTasksTable from "@/entrypoints/options/components/HouseTasksTable.vue";
import {onMounted, ref} from "vue";
import { RowSelectionState} from "@tanstack/vue-table";
import {Button} from "@/components/ui/button";
import {oneHouseEntry} from "@/entrypoints/reuse/house-control";
import {BatchQueueExecutor, Job} from "@/utils/lib/BatchQueueExecutor";
import {browser} from "wxt/browser";
import BatchJobRunningStatusBar from "@/components/lj/BatchJobRunningStatusBar.vue";
import {sendMessage} from "webext-bridge/popup";
import {sleep} from "radash";

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

  <HouseTasksTable :data="data" :row-count="rowCount" @on-pagination-change="queryData" v-model:row-selection="rowSelection"/>

</template>

<style scoped>

</style>