<script lang="ts" setup>

import SimpleDrawer from "@/components/layout/SimpleDrawer.vue";
import {parseAllOfCommunity} from "@/entrypoints/content/community-dom-parse";
import {Button} from "@/components/ui/button";
import {CommunityBasic, CommunityList, CommunityModelUtil, CommunityTask} from "@/types/lj";
import ObjectTable from "@/components/table/ObjectTable.vue";
import {beginCrawl} from "@/entrypoints/content/community-crawl";
import {extractCidFromHomePageUrl} from "@/utils/lj-url";
import {injectFuzzyStyle} from "@/entrypoints/content/lj-disguise";
import {sendMessage} from 'webext-bridge/content-script';

// 使用示例


const item = ref<CommunityBasic & CommunityList>()
const cid=ref<string|undefined>()
const isTaskCreated=ref(false)
const taskInDb=ref<CommunityTask>()
onMounted(async () => {
  console.log('content UI mounted.')

  await initParseAndQuery()

})
async function initParseAndQuery(){
  const cidFromUrl=extractCidFromHomePageUrl(window.location.href)
  if(!cidFromUrl){
    throw new Error('cid not exist: '+window.location.href)
  }
  cid.value=cidFromUrl
  queryTask(cidFromUrl).then(()=>console.log('queryTask done.'))
  parseAllOfCommunity().then((_rs)=>{
    item.value = _rs
  })

}

async function createTask(){
  if(!item.value){
    throw new Error('item not exist')
  }
  const newTask=CommunityModelUtil.newCommunityTaskFromItem(item.value)
  const resp=await sendMessage('addCommunityTask', newTask, 'background')
  console.log('addTask throw message suc.',resp)
  // await db.communityTasks.add(newTask)
  await queryTask(newTask.cid)
}

async function queryTask(cid:string){
  const start=Date.now()
  const queryTask =await  sendMessage('queryCommunityTask', {cid},'background')

  console.debug('query Task throw message suc. cost:',Date.now()-start,'ms')
  if (queryTask.length > 1){
    console.warn('duplicate task',cid)
  }else if (queryTask.length === 0) {
    isTaskCreated.value=false
    taskInDb.value=undefined
    return
  }

  isTaskCreated.value=true
  taskInDb.value=queryTask[0]
}


</script>

<template>
  <SimpleDrawer id="ui-container" class="fixed top-0 right-0 max-w-96 max-h-full text-sm bg-white" :default-open="true">
    <h1 class="text-gray-500 font-extrabold">
      Community List Page
    </h1>
    <div>
      <Button @click="initParseAndQuery">parse</Button>
      <Button @click="injectFuzzyStyle">injectStyle</Button>
    </div>

    <div v-if="isTaskCreated">
      <div>task exist.</div>
      <Button v-if="cid && item && item.city" @click="beginCrawl(item.city,cid,item.maxPageNo)">beginTaskCrawl</Button>
      <ObjectTable :data="taskInDb as any"/>
    </div>

    <div v-else>
      <div>no task.</div>
      <Button @click="createTask">Create Task</Button>
      <ObjectTable :data="item"/>

    </div>
    <details>
      <summary>pre item</summary>
      <div><pre>{{ JSON.stringify(item, null, 2) }}</pre>      </div>
    </details>

  </SimpleDrawer>

</template>

<style scoped>
#ui-container * {
  background-color: rgba(115, 92, 83, 0.56) !important;
  color: rgba(191, 189, 189, 0.38) !important;
}
</style>
