<script setup lang="ts">
import {useRouter,useRoute} from "vue-router";
import {db} from "@/utils/client/Dexie";
import ObjectTable from "@/components/table/ObjectTable.vue";
import {CommunityRecord, CommunityTask, HouseChange, HouseTask} from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import {AccessRecord} from "../../../utils/lib/AcessRecord";
import {Button} from "@/components/ui/button";
import {runHouseTaskManualRunCrawlOne} from "@/entrypoints/reuse/house-control";

const {query}=useRoute()
const cid=query['id']

const task=ref<CommunityTask>()
const records=ref<CommunityRecord[]>()
async function queryData(){
  task.value=await db.communityTasks.where('cid').equals(cid).first()
  records.value=await db.communityRecords.where('cid').equals(cid).toArray()
  console.log('task',task.value)
  console.log('records',records.value)
}

function task2ObjectTableData(t:CommunityTask){
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
<!--      <Button @click="runHouseTaskManualRunCrawlOne(task.cid)">crawl</Button>-->
      <a :href="genCommunityPageUrl(task?.city,task?.cid,1)" target="_blank"  rel="noreferrer">link</a>
    </div>
  </div>

  <div class="c-block">
    <h2> task </h2>
    <ObjectTable :data="task2ObjectTableData(task)"/>
  </div>




<!--  <div class="c-block">-->
<!--    <h2> changes </h2>-->
<!--    <div>-->
<!--      <div v-for="change in changes" class="flex flex-row gap-3">-->
<!--        <div>{{new Date(change.at).toLocaleString()}}</div>-->
<!--        <div> {{change.oldValue}}</div>-->
<!--        <div> →</div>-->
<!--        <div> {{change.newValue}}</div>-->
<!--      </div>-->
<!--    </div>-->
<!--  </div>-->

  <div class="c-block">
    <h2>access record</h2>
    <CalendarGraph v-if="task" :access-record="AccessRecord.fromAccessRecord(task?.accessRecord)"/>
  </div>

  <div class="c-block">

  </div>






</template>

<style scoped>

</style>