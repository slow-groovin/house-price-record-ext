<script lang="ts" setup>

import ContentUIContainer from "@/components/layout/ContentUIContainer.vue";
import TwoLineAt from "@/components/lj/column/TwoLineAt.vue";
import ObjectTable from "@/components/table/ObjectTable.vue";
import { Button } from "@/components/ui/button";
import { parseAllOfCommunity, parseCommunityHome } from "@/entrypoints/content/util/community-dom-parse";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import { sendMessage } from '@@/messaging';
import { CommunityBasic, CommunityModelUtil, CommunityTask } from "@/types/lj";
import { extractCidFromHomeOrListUrl, isCommunityHomePage, isCommunityListPage } from "@/utils/lj-url";
import { Icon } from "@iconify/vue";
import { onMounted, ref } from "vue";

const { isDebug } = useDevSetting()



const item = ref<CommunityBasic>()
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

  let cidFromUrl: string | null = extractCidFromHomeOrListUrl(url)

  if (!cidFromUrl) {
    throw new Error('cid not exist: ' + window.location.href)
  }
  cid.value = cidFromUrl
  queryTask(cidFromUrl).then(() => console.log('queryTask done.'))
  if (isCommunityHomePage(url)) {
    item.value = parseCommunityHome()
  } else if (isCommunityListPage(url)) {
    parseAllOfCommunity().then((_rs) => {
      item.value = _rs
    })
  }

}

async function createTask() {
  if (!item.value) {
    throw new Error('item not exist')
  }
  const newTask = CommunityModelUtil.newCommunityTaskFromItem(item.value)
  const resp = await sendMessage('addCommunityTask', newTask)
  console.log('addTask suc.', resp)
  // await db.communityTasks.add(newTask)
  await queryTask(newTask.cid)
}

async function queryTask(cid: string) {
  const start = Date.now()
  const queryTask = await sendMessage('queryCommunityTask', { cid })

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

  <ContentUIContainer>
    <div class="flex flex-col gap-2">
      <h2 class="text-gray-500 font-extrabold">
        小区页面
        <span class="ml-4 text-primary">{{ item?.name ?? '' }}</span>
      </h2>

      <details v-if="isDebug">
        <summary>debug</summary>
        <div>
          <Button @click="initParseAndQuery">parse</Button>
        </div>
      </details>

      <div v-if="taskInDb" class="flex flex-col gap-2">
        <div>任务已创建
          <a @click="openOption" class="text-green-500 underline cursor-pointer">去查看</a>
        </div>



        <table class="">
          <tbody>
            <tr>
              <th>创建时间:</th>
              <th>
                <div class="flex gap-4">
                  <TwoLineAt :at="taskInDb.createdAt" />
                </div>
              </th>
            </tr>
            <tr>
              <th>上次运行时间:</th>
              <th>
                <div class="flex gap-4">
                  <TwoLineAt :at="taskInDb.lastRunningAt" />
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

        <Button v-if="cid && item && item.city" @click="openOption()" class="w-fit [&_svg]:size-4 p-1 self-center">
          <Icon icon="solar:play-bold" />
          去手动运行
        </Button>
      </div>

      <div v-else>
        <div class="rounded p-2 bg-gray-200">尚未创建任务</div>
        <Button @click="createTask">创建任务</Button>
        <!--      <ObjectTable :data="item"/>-->
      </div>


      <details v-if="isDebug">
        <summary>debug</summary>
        <ObjectTable :data="taskInDb as any" />
        <ObjectTable :data="item" />
        <div>
          <pre>{{ JSON.stringify(item, null, 2) }}</pre>
        </div>
      </details>
    </div>

  </ContentUIContainer>

</template>

<style scoped>
table,
tr,
th {
  border: 1px solid lightgray;
  vertical-align: middle;
  text-align: center;
}
</style>
