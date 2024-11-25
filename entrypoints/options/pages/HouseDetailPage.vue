<script setup lang="ts">
import {useRouter,useRoute} from "vue-router";
import {db} from "@/utils/client/Dexie";
import ObjectTable from "@/components/table/ObjectTable.vue";
import {HouseChange, HouseTask} from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import {AccessRecord} from "../../../utils/lib/AcessRecord";
import {Button} from "@/components/ui/button";
import {runHouseTaskManualRunCrawlOne} from "@/entrypoints/reuse/house-control";

const {query,params}=useRoute()
const hid=query['id']

const task=ref<HouseTask>()
const changes=ref<HouseChange[]>()
async function queryData(){
  task.value=await db.houseTasks.where('hid').equals(hid).first()
  changes.value=await db.houseChanges.where('hid').equals(hid).toArray()
  console.log(task.value?.accessRecord)
  console.log(changes.value)
}

function task2ObjectTableData(t:HouseTask){
  return {
    ...t,
    createdAt: new Date(t?.createdAt).toLocaleString(),
    lastRunningAt: new Date(t?.lastRunningAt).toLocaleString()
  }
}
onMounted(()=>{
  queryData()
})
</script>

<template>

  <div class="c-block">
    <h2>actions</h2>
    <div>
      <Button @click="runHouseTaskManualRunCrawlOne(task.hid)">crawl</Button>
      <a :href="genHousePageUrl(task?.city,task?.hid)" target="_blank"  rel="noreferrer">link</a>
    </div>
  </div>

  <div class="c-block">
    <h2> task </h2>
    <ObjectTable :data="task2ObjectTableData(task)"/>
  </div>




  <div class="c-block">
    <h2> changes </h2>
    <div>
      <div v-for="change in changes" class="flex flex-row gap-3">
        <div>{{new Date(change.at).toLocaleString()}}</div>
        <div> {{change.oldValue}}</div>
        <div> →</div>
        <div> {{change.newValue}}</div>
      </div>
    </div>
  </div>

  <div class="c-block">
    <h2>access record</h2>
    <CalendarGraph v-if="task" :access-record="AccessRecord.fromAccessRecord(task?.accessRecord)"/>
  </div>

  <div class="c-block">

  </div>






</template>

<style scoped>

</style>