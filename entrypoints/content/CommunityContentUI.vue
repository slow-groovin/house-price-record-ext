<script lang="ts" setup>

import SimpleDrawer from "@/components/layout/SimpleDrawer.vue";
import {parseAllOfCommunity} from "@/entrypoints/content/community-dom-parse";
import {Button} from "@/components/ui/button";
import {CommunityListPageItem, CommunityModelUtil, CommunityTask} from "@/types/lj";
import ObjectTable from "@/components/table/ObjectTable.vue";

import {extractCidFromListUrl} from "@/utils/lj-url";
import {injectFuzzyStyle} from "@/entrypoints/content/lj-disguise";
import {sendMessage} from '@/messaging';
import {onMounted, ref} from "vue";
import {Icon} from "@iconify/vue";
import {useDevSetting} from "@/entrypoints/reuse/global-variables";
import TwoLineAt from "@/components/lj/column/TwoLineAt.vue";
import {HTMLDivElement} from "linkedom";

const {isDebug} = useDevSetting()


const contentDrawer = ref<HTMLDivElement | null>()


const item = ref<CommunityListPageItem>()
const cid = ref<string | undefined>()
const taskInDb = ref<CommunityTask>()
onMounted(async () => {
  console.log('content UI mounted.')

  await initParseAndQuery()
})

function openOption() {
  sendMessage('openOptionPage', '/options.html#/c/task/detail?id=' + cid.value)
}


async function initParseAndQuery() {
  const url = window.location.href

  let cidFromUrl: string | null = extractCidFromListUrl(url)

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
  const resp = await sendMessage('addCommunityTask', newTask)
  console.log('addTask throw message suc.', resp)
  // await db.communityTasks.add(newTask)
  await queryTask(newTask.cid)
}

async function queryTask(cid: string) {
  const start = Date.now()
  const queryTask = await sendMessage('queryCommunityTask', {cid})

  console.debug('query Task throw message suc. cost:', Date.now() - start, 'ms')
  if (queryTask.length > 1) {
    console.warn('duplicate task', cid)
  } else if (queryTask.length === 0) {
    taskInDb.value = undefined
    return
  }
  taskInDb.value = queryTask[0]
}

</script>

<template>

  <SimpleDrawer ref="contentDrawer"
                class="contentDrawer  fixed top-0 right-0 max-w-96 max-h-full text-sm "
                :default-open="true"
                :position="'right'">
    <div class="bg-neutral-100 rounded p-2">
      <h1 class="text-gray-500 font-extrabold">
        小区列表页面
      </h1>

      <details v-if="isDebug">
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

        <table class="border">
          <tbody>
          <tr>
            <th>创建时间:</th>
            <th>
              <div class="flex gap-4">
                <TwoLineAt :at="taskInDb.createdAt"/>
              </div>
            </th>
          </tr>
          <tr>
            <th>上次运行时间:</th>
            <th>
              <div class="flex gap-4">
                <TwoLineAt :at="taskInDb.lastRunningAt"/>
              </div>
            </th>
          </tr>
          <tr>
            <th>运行次数:</th>
            <th>
              {{ taskInDb.runningCount }}
            </th>
          </tr>
          </tbody>
        </table>
      </div>

      <div v-else>
        <div class="rounded p-2 bg-gray-200">尚未创建任务</div>
        <Button @click="createTask">创建任务</Button>
        <!--      <ObjectTable :data="item"/>-->
      </div>


      <details v-if="isDebug">
        <summary>debug</summary>
        <ObjectTable :data="taskInDb as any"/>
        <ObjectTable :data="item"/>
        <div>
          <pre>{{ JSON.stringify(item, null, 2) }}</pre>
        </div>
      </details>
    </div>

  </SimpleDrawer>

</template>

<style scoped>
table, tr, th {
  border: 1px solid gray;
  vertical-align: middle;
  text-align: center;
}
</style>
