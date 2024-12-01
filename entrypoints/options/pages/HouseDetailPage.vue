<script setup lang="ts">
import {useRoute} from "vue-router";
import {db} from "@/utils/client/Dexie";
import ObjectTable from "@/components/table/ObjectTable.vue";
import {CommonFieldChange, HouseChange, HouseStatusChange, HouseTask, HouseTaskStatus} from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import {Button} from "@/components/ui/button";
import {oneHouseEntry} from "@/entrypoints/reuse/house-control";
import {onMounted, ref} from "vue";
import {genHousePageUrl} from "@/utils/lj-url";

const {query}=useRoute()
const hid=query['id'] as string

const task=ref<HouseTask>()
const changes=ref<HouseChange[]>()
const statusChanges=ref<HouseStatusChange[]>()
const commonFieldChanges=ref<CommonFieldChange[]>()
async function queryData(){
  task.value=await db.houseTasks.where('hid').equals(hid).first()
  changes.value=await db.houseChanges.where('hid').equals(hid).toArray()
  statusChanges.value=await db.houseStatusChanges.where('hid').equals(hid).toArray()
  commonFieldChanges.value=await db.houseCommonFieldChanges.where('hid').equals(hid).toArray()
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
    <div v-if="task">
      <Button v-if="task.hid" @click="oneHouseEntry(hid)">crawl</Button>
      <a v-if="task.city && task.hid" :href="genHousePageUrl(task?.city,task?.hid)" target="_blank"  rel="noreferrer">link</a>
    </div>
  </div>

  <div class="c-block">
    <h2> task </h2>
    <ObjectTable v-if="task" :data="task2ObjectTableData(task)"/>
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
    <h2> common field changes </h2>
    <div>
      <div v-for="change in commonFieldChanges" class="flex flex-row gap-3">
        <div>{{new Date(change.at).toLocaleString()}}</div>
        <div> {{change.name }}</div>
        <div> {{change.oldValue}}</div>
        <div> →</div>
        <div> {{change.newValue}}</div>
      </div>
    </div>
  </div>

  <div class="c-block">
    <h2> status changes </h2>
    <div>
      <div v-for="change in statusChanges" class="flex flex-row gap-3">
        <div>{{new Date(change.at).toLocaleString()}}</div>
        <div> {{HouseTaskStatus[change.oldValue]}}</div>
        <div> →</div>
        <div> {{HouseTaskStatus[change.newValue]}}</div>
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