<script lang="ts" setup>

import SimpleDrawer from "@/components/layout/SimpleDrawer.vue";
import {parseAllOfCommunity} from "@/entrypoints/content/community-dom-parse";
import {Button} from "@/components/ui/button";
import {CommunityListPageItem, CommunityModelUtil, CommunityTask} from "@/types/lj";
import ObjectTable from "@/components/table/ObjectTable.vue";

import {extractCidFromListUrl} from "@/utils/lj-url";
import {injectFuzzyStyle} from "@/entrypoints/content/lj-disguise";
import {sendMessage} from 'webext-bridge/content-script';
import {onMounted, ref} from "vue";
import {Icon} from "@iconify/vue";

if (import.meta.env.VITE_HIDE === 'true') {
  import('~/assets/disguise.css');
}


const item = ref<CommunityListPageItem>()
const cid = ref<string | undefined>()
const taskInDb = ref<CommunityTask>()
onMounted(async () => {
  console.log('content UI mounted.')

  await initParseAndQuery()

})

function openOption() {
  sendMessage('openOptionPage', '/options.html#/c/task/detail?id=' + cid.value, 'background')
}


async function initParseAndQuery() {
  const cidFromUrl = extractCidFromListUrl(window.location.href)
  if (!cidFromUrl) {
    throw new Error('cid not exist: ' + window.location.href)
  }
  cid.value = cidFromUrl
  queryTask(cidFromUrl).then(() => console.log('queryTask done.'))
  parseAllOfCommunity().then((_rs) => {
    item.value = _rs
  })
}

async function createTask() {
  if (!item.value) {
    throw new Error('item not exist')
  }
  const newTask = CommunityModelUtil.newCommunityTaskFromItem(item.value)
  const resp = await sendMessage('addCommunityTask', newTask, 'background')
  console.log('addTask throw message suc.', resp)
  // await db.communityTasks.add(newTask)
  await queryTask(newTask.cid)
}

async function queryTask(cid: string) {
  const start = Date.now()
  const queryTask = await sendMessage('queryCommunityTask', {cid}, 'background')

  console.debug('query Task throw message suc. cost:', Date.now() - start, 'ms')
  if (queryTask.length > 1) {
    console.warn('duplicate task', cid)
  } else if (queryTask.length === 0) {
    taskInDb.value = undefined
    return
  }
  taskInDb.value = queryTask[0]
}

async function beginCrawl() {
  //通过background启动
  // await sendMessage('crawlCommunityTask',{cid:String(cid.value)},'background')
  //跳转到option中间页, 然后点击开始后 再启动sidebar开始
}


</script>

<template>
  <SimpleDrawer id="ui-container" class="fixed top-0 right-0 max-w-96 max-h-full text-sm " :default-open="true"
                :position="'right'">
    <h1 class="text-gray-500 font-extrabold">
      Community List Page
    </h1>

    <details>
      <summary>debug</summary>
      <div>
        <Button @click="initParseAndQuery">parse</Button>
        <Button @click="injectFuzzyStyle">injectStyle</Button>
      </div>
    </details>

    <div v-if="taskInDb">
      <div>任务已创建
        <a @click="openOption" class="text-green-500 underline cursor-pointer">去查看</a>
      </div>

      <Button v-if="cid && item && item.city" @click="openOption()">
        <Icon icon="solar:refresh-circle-broken" class="w-6 h-6"/>
        去手动运行
      </Button>

      <ObjectTable :data="{
        '上次运行时间': new Date(taskInDb.lastRunningAt).toLocaleString(),
        '创建时间': new Date(taskInDb.createdAt).toLocaleString(),
        '共运行次数': taskInDb.runningCount,
      }"/>
      <!--      <ObjectTable :data="taskInDb as any"/>-->
    </div>

    <div v-else>
      <div>尚未创建任务</div>
      <Button @click="createTask">创建任务</Button>
      <!--      <ObjectTable :data="item"/>-->
    </div>


    <details>
      <summary>debug</summary>
      <ObjectTable :data="taskInDb as any"/>
      <ObjectTable :data="item"/>
      <div>
        <pre>{{ JSON.stringify(item, null, 2) }}</pre>
      </div>
    </details>

  </SimpleDrawer>

</template>

<style scoped>

</style>
