<script setup lang="ts">
import {useRoute} from "vue-router";
import {db} from "@/utils/client/Dexie";
import ObjectTable from "@/components/table/ObjectTable.vue";
import {CommonFieldChange, HouseChange, HouseStatusChange, HouseTask, HouseTaskStatus} from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import {Button} from "@/components/ui/button";
import {oneHouseEntry} from "@/entrypoints/reuse/house-control2";
import {onMounted, ref} from "vue";
import {genHousePageUrl} from "@/utils/lj-url";
import {toast} from "vue-sonner";
import {updateOneMiss, updateOneNormal, updateOneSold} from "@/entrypoints/reuse/house-update";
import {NoRetryError, PauseError} from "@/utils/lib/BatchQueueExecutor";
import {useMutation} from "@tanstack/vue-query";
import {HouseNormal, HouseSold} from "@/types/LjUpdatePreview";
import {Icon} from "@iconify/vue";

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
}

async function beginCrawlOne(){
  try{
    const rs=await oneHouseEntry(hid)
    if(!rs){ //不会落入这个分支
      return
    }
    if(rs.type==='normal'){
      await updateOneNormal(rs as HouseNormal, task.value!, Date.now())
      toast.success('任务更新成功!(状态:在售)')
    }else if(rs.type==='sold'){
      await updateOneSold(rs as HouseSold, task.value!, Date.now())
      toast.success('任务更新成功!(状态:售出)')
    }else if(rs.type==='miss'){
      await updateOneMiss(rs, task.value!, Date.now())
      toast.success('任务更新成功!(状态:下架)')
    }
  }catch (e) {
    if(e instanceof PauseError){
      toast.warning('任务中断:'+e.message,{duration: 10000})
    }else{
      toast.error('任务失败:'+(e as Error).message,{duration: 10000})
    }
  }

  await queryData()
}

const {status:beginCrawlStatus, mutate:beginCrawlMutate}=useMutation({
  mutationFn: beginCrawlOne,
})

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
      <div v-if="task.hid">
        <Button v-if="beginCrawlStatus!=='pending'" @click="beginCrawlMutate()">crawl</Button>
        <Icon v-else icon="eos-icons:bubble-loading" class="w-16 h-16 text-green-500"/>


      </div>
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