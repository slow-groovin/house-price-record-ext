<template>
  <div>
    <div>
      <Button @click="refreshPageCrawlAndTaskInDb">REFRESH</Button>
      <Button @click="forTestRandomChangePrice">random change price</Button>
      <details>
        <summary>parsed item</summary>
        <ObjectTable :data="houseItem" />
      </details>
    </div>
    <div v-if="!isTaskExist">
      <Button @click="createTask">createTask</Button>
    </div>
    <div v-else class="c-block">
      <div>已添加任务√</div>

      <a :href="'/options.html#/h/task/detail?id=' + houseItem?.hid" target="_blank">{{ houseItem?.hid }}</a>
      <!--    debug buttons-->
      <div>
        <Button @click="manualCrawl">make record</Button>
      </div>


      <details>
        <summary>task</summary>
        <ObjectTable :data="houseTask" />
      </details>

      <details>
        <summary>changes</summary>
        <div>
          <h2>changes List</h2>
          <ul>
            <li v-for="item in changes" :key="item.id">
              [{{ item.id }}] {{ item.oldValue }} -> {{ item.newValue }} {{ new Date(item.at).toLocaleString() }}
              <button v-if="item.id" @click="deleteRecordItem(item.id)">Delete</button>
            </li>
          </ul>
        </div>
      </details>
      <details>
        <summary>calendar</summary>
        <div>
          <CalendarGraph v-if="houseTask?.accessRecord" :access-record="houseTask?.accessRecord" />
        </div>
      </details>



    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { sendMessage } from "@@/messaging";
import { db } from "@/entrypoints/db/Dexie";
import { HouseChange, HouseItem, HouseTask } from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import { handleNormalPage } from '@/entrypoints/reuse/house-control2'
import ObjectTable from "@/components/table/ObjectTable.vue";
import { onMounted, ref, watchEffect } from "vue";

const props = defineProps<{ tabId: number }>()
const isTaskExist = ref(false)
// const isLastRecordIntervalGtMin=ref(false)
const houseItem = ref<HouseItem | null>(null)
const changes = ref<HouseChange[]>([])
const houseTask = ref<HouseTask | null | undefined>()
const tempHid = ref('')


onMounted(() => {
  refreshPageCrawlAndTaskInDb()
})

watchEffect(() => {
  refreshPageCrawlAndTaskInDb()

})

async function fetchLast10Changes(hid: string) {
  changes.value = await db.houseChanges.where('hid').equals(hid).reverse().limit(10).toArray()

}


/**
 * 刷新: 重新向页面的content.js中请求爬取信息,
 * 以及向db查询task信息,changes信息
 */
async function refreshPageCrawlAndTaskInDb() {
  const resp = await sendMessage('parseHouse', undefined, props.tabId)
  const task = await db.houseTasks.where('hid').equals(resp.hid).first()
  // console.log('task',task)
  if (task)
    houseTask.value = HouseTask.fromHouseTask(task)
  isTaskExist.value = !!task
  houseItem.value = resp
  tempHid.value = resp.hid

  fetchLast10Changes(resp.hid)

}

async function createTask() {
  const resp = await sendMessage('parseHouse', undefined, props.tabId)
  const count = await db.houseTasks.where('hid').equals(resp.hid).count()

  if (count > 0) {
    alert('任务已存在' + resp.hid)
  } else {
    let houseTask = HouseTask.newFromItem(resp);
    houseTask.markAccess()
    const task = await db.houseTasks.add(houseTask)
    alert(JSON.stringify(task))
    isTaskExist.value = true
  }
}

async function manualCrawl() {
  // console.log('[sidebar][HouseTaskPanel]begin  crawl house page.')
  //
  // const {houseTask:task,respParsedItem}=await handleNormalPage(props.tabId,houseTask.value)
  // console.log('[sidebar][HouseTaskPanel]crawl house page done.',task,respParsedItem)
  // await fetchLast10Changes(task.hid)
  // houseTask.value=task
  // houseItem.value=respParsedItem
}

async function forTestRandomChangePrice() {
  await sendMessage('simple', "changePriceForTest", props.tabId)
}

async function deleteRecordItem(id: number) {
  await db.houseChanges.delete(id);
  await fetchLast10Changes(tempHid.value)
}
</script>


<style scoped></style>