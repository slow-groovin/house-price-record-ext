<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {sendMessage} from "webext-bridge/popup";
import {db} from "@/utils/client/Dexie";
import {HouseChange, HouseItem, HouseTask} from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";

const props=defineProps<{tabId:number}>()
const isTaskExist=ref(false)
// const isLastRecordIntervalGtMin=ref(false)
const houseItem=ref<HouseItem|null>(null)
const changes=ref<HouseChange[]>([])
const houseTask=ref<HouseTask|null>()
const tempHid=ref('')


onMounted(()=>{
  fetchHouseItem()
})

watchEffect(()=>{
  fetchHouseItem()

})

async function fetchLastRecords(hid:string){
  changes.value=await db.houseChanges.where('hid').equals(hid).reverse().limit(10).toArray()

}

async function fetchLastRecord(hid:string){
  const lastRecords=await db.houseChanges.where('hid').equals(hid).last()
}

async function fetchHouseItem(){
  const resp = await sendMessage('parseHouse', {}, 'content-script@'+props.tabId)
  const count=await db.houseTasks.where('hid').equals(resp.hid).count()
  isTaskExist.value=count>0
  houseItem.value=resp
  tempHid.value=resp.hid

  fetchLastRecord(resp.hid)
  fetchLastRecords(resp.hid)

}

async function createTask(){
  const resp = await sendMessage('parseHouse', {}, 'content-script@'+props.tabId)
  const count=await db.houseTasks.where('hid').equals(resp.hid).count()

  if(count>0){
    alert('任务已存在'+resp.hid)
  }else{
    let houseTask = HouseTask.newFromItem(resp);
    houseTask.markAccess()

    const task=await db.houseTasks.add(houseTask)
    alert(JSON.stringify(task))
    isTaskExist.value=true
  }
}

async function manualAddRecord(){
  const resp = await sendMessage('parseHouse', {}, 'content-script@'+props.tabId)
  const queryResult=await db.houseTasks.where('hid').equals(resp.hid).first()

  if(!queryResult){
    console.error('task not create:'+resp.hid)
    return
  }
  const currentTask=HouseTask.fromHouseTask(queryResult)
  houseTask.value=currentTask


  if(!currentTask.totalPrice){
    //todo: store info initially
    return;
  }


  if(resp.totalPrice && currentTask?.totalPrice!==resp.totalPrice){
    await db.houseChanges.add({
      hid: resp.hid,
      cid: resp.cid,
      at: Date.now(),
      oldValue: currentTask.totalPrice,
      newValue: resp.totalPrice,
    })
    currentTask.markAccess()
    await db.houseTasks.update(currentTask.id,{
      totalPrice:resp.totalPrice,
      unitPrice: resp.unitPrice,
      lastRunningAt: Date.now(),
      accessRecord:currentTask.accessRecord
    })
    await fetchLastRecord(resp.hid)
    await fetchLastRecords(resp.hid)
  }
}

async function forTestRandomChangePrice(){
  await sendMessage('simple', "changePriceForTest", 'content-script@'+props.tabId)
}

async function deleteRecordItem(id:number){
  await db.houseChanges.delete(id);
  await fetchLastRecords(tempHid.value)
}
</script>

<template>
<div>
  <div v-if="!isTaskExist">
    <Button @click="createTask">createTask</Button>
  </div>
  <div v-else>
    <div>已添加任务√</div>
    <div>{{houseItem?.hid}}</div>
<!--    debug buttons-->
    <div>
      <Button @click="manualAddRecord" >manual record</Button>
      <Button @click="forTestRandomChangePrice" >random change price</Button>

    </div>
    <div>
      <h2>Items List</h2>
      <ul>
        <li v-for="item in changes" :key="item.id">
          [{{ item.id }}]  {{ item.oldValue }} -> {{item.newValue}}    {{ new Date(item.at).toLocaleString() }}
          <button @click="deleteRecordItem(item.id)">Delete</button>
        </li>
      </ul>
    </div>

    <div>
      <CalendarGraph v-if="houseTask?.accessRecord" :access-record="houseTask?.accessRecord"/>
    </div>
  </div>
</div>
</template>

<style scoped>

</style>