<script lang="ts" setup>

import ContentUIContainer from "@/components/layout/ContentUIContainer.vue";
import TwoLineAt from "@/components/lj/column/TwoLineAt.vue";
import ObjectTable from "@/components/table/ObjectTable.vue";
import { Button } from "@/components/ui/button";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import { sendMessage } from '@@/messaging';
import { Icon } from "@iconify/vue";
import { onMounted, ref } from "vue";
import { RentCommunityTask, RentModelUtils } from '@/types/rent';
import { parseAllOfKeRentCommunity } from "../util/ke-rent-community-dom-parse";
import { toRaw } from "#imports";

const { isDebug } = useDevSetting()


const parsedResult = ref<Awaited<ReturnType<typeof parseAllOfKeRentCommunity>>>()
const cid = ref<string | undefined>()
const taskInDb = ref<RentCommunityTask>()
onMounted(async () => {
  await initParseAndQuery()
  console.log('parsedRs', toRaw(parsedResult.value))

})

function openOption() {
  sendMessage('openOptionPage', '/options.html#/rent/c/task/detail?id=' + cid.value)
}


async function initParseAndQuery() {
  parsedResult.value = await parseAllOfKeRentCommunity()

  if (!parsedResult.value.cid) {
    throw new Error('cid not exist: ' + window.location.href)
  }
  cid.value = parsedResult.value.cid
  queryTask(parsedResult.value.cid).then(() => console.log('queryTask done.'))


}

async function createTask() {
  if (!parsedResult.value?.cid) {
    throw new Error('item not exist')
  }
  const newTask = RentModelUtils.newCommunityTaskFromItem(parsedResult.value)
  const resp = await sendMessage('addKeRentCommunityTask', newTask)
  console.log('addTask suc.', resp)
  // await db.communityTasks.add(newTask)
  await queryTask(newTask.cid)
}

async function queryTask(cid: string) {
  const start = Date.now()
  const queryTask = await sendMessage('queryKeRentCommunityTask', { cid })

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
      <h2 class="text-blue-500 font-extrabold">
        租房小区列表页面
        <span class="ml-4 text-blue-500">{{ parsedResult?.name ?? '' }}</span>
      </h2>

      <details v-if="isDebug">
        <summary>debug</summary>
        <div>
          <Button @click="initParseAndQuery">parse</Button>
        </div>
      </details>

      <div v-if="taskInDb" class="flex flex-col gap-2">
        <div>任务已创建
          <a @click="openOption" class="text-blue-500 underline cursor-pointer">去查看</a>
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

        <Button v-if="cid && parsedResult && parsedResult.city" @click="openOption()"
          class="w-fit [&_svg]:size-4 p-1 self-center bg-blue-500">
          <Icon icon="solar:play-bold" />
          去手动运行
        </Button>
      </div>

      <div v-else>
        <div class="rounded p-2 bg-gray-200">尚未创建任务</div>
        <Button @click="createTask" class="bg-blue-500">创建任务</Button>
        <!--      <ObjectTable :data="item"/>-->
      </div>


      <details v-if="isDebug">
        <summary>debug</summary>
        <ObjectTable :data="taskInDb as any" />
        <ObjectTable :data="parsedResult" />
        <div>
          <pre>{{ JSON.stringify(parsedResult, null, 2) }}</pre>
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
