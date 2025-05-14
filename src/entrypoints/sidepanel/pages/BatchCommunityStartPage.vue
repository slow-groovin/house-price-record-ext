<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Button } from "@/components/ui/button";
import { useRoute } from "vue-router";
import { db } from "@/entrypoints/db/Dexie";
import { toInt, uid } from "radash";
import { goSidePanelHome, openUrlForHid } from "@/entrypoints/sidepanel/pages/reuse";
import { BatchQueueExecutor, Job, JobContext, PauseError } from "@/utils/lib/BatchQueueExecutor";
import { oneCommunityEntry } from "@/entrypoints/reuse/community-control"
import { useLocalStorage } from "@vueuse/core";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/vue";
import BatchJobRunningStatusBar from "@/components/lj/BatchJobRunningStatusBar.vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CommunityUpdatePreview } from "@/types/LjUpdatePreview";
import { CommunityTask } from "@/types/lj";
import { browser } from "wxt/browser";
import { removeRepeat } from "@/utils/array";
import InfoHover from "@/components/information/InfoHover.vue";
import { EyeIcon } from "lucide-vue-next";


const { query: { id } } = useRoute()


const tempId = toInt(id)
if (!id || !tempId) {
  goSidePanelHome()
}


const PREFIX = '[BatchCommunity]'
console.log(PREFIX, 'tempId:', tempId)

const communityList = ref<CommunityTask[]>()
const batchExecutor = ref<BatchQueueExecutor>()
const isInit = ref(true)
const isFinished = ref(false)
const pausedContext = ref<JobContext>()
const pausedError = ref<PauseError>()

const interval = useLocalStorage('batch-community-setting-interval', 1000)
const retryTime = useLocalStorage('batch-community-setting-retryTime', 1)
const maxConcurrent = useLocalStorage('batch-community-setting-maxConcurrent', 3)

const DEFAULT_SETTING = {
  interval: 3000,
  retryTime: 1,
  maxConcurrent: 3
}

function resetSetting() {
  interval.value = DEFAULT_SETTING.interval
  retryTime.value = DEFAULT_SETTING.retryTime
  maxConcurrent.value = DEFAULT_SETTING.maxConcurrent
}

onMounted(async () => {
  communityList.value = (await db.tempBatchCommunity.get(tempId))?.communityList
  if (!communityList.value) {
    goSidePanelHome()
  }
  // await db.tempBatchCommunity.delete(tempId)
})


let preview: CommunityUpdatePreview = {
  at: Date.now(),
  batchId: '',
  tempListId: tempId,
  records: []
}

function* jobIter(): IterableIterator<Job> {
  for (let community of communityList.value as CommunityTask[]) {
    yield {
      promiseGetter: () => oneCommunityEntry(community, { interval: interval.value }).then(rs => {
        //idList去重
        rs.houseList = removeRepeat(rs.houseList, item => item.hid)

        preview.records.push(rs)
      }),
      context: {
        id: community.cid as string,
        task: community,
      }
    }
  }
}

/**
 * 批量开启任务
 */
async function startBathCommunity() {
  isInit.value = false
  const batchId = uid(16)
  //刷新preview
  preview = {
    at: Date.now(),
    batchId: batchId,
    tempListId: tempId,
    records: []
  }
  //
  batchExecutor.value = new BatchQueueExecutor(jobIter(), {
    retryTimes: retryTime.value,
    interval: interval.value,
    maxConcurrent: maxConcurrent.value,
    log: true,
  })
  //
  batchExecutor.value.on('onPause', (context, err) => {
    pausedContext.value = context
    pausedError.value = err
  })
  //
  batchExecutor.value.on('onFinished', async () => {
    isFinished.value = true

    console.log('preview', preview)

    //存储preview
    await db.tempCommunityUpdatePreview.add(preview)
    //弹出结算页
    await browser.tabs.create({ url: "/options.html#/c/update/preview?id=" + batchId })
  })

  setTimeout(() => {
    batchExecutor.value!.run()
  }, 1000)


}

</script>


<template>
  <div class="flex flex-col gap-4 p-2">

    <h1 class="mt-2 text-primary font-bold text-xl">▶︎ (二手房)批量小区任务运行</h1>

    <!--  init hint-->
    <div v-if="isInit && communityList"
      class="min-h-64 flex flex-col items-center gap-4 justify-center border rounded ">
      <div>
        本次任务, 共需打开 {{ communityList.length }} 个小区页面
        <InfoHover>
          <template #trigger>
            <EyeIcon class="inline size-6 hover:bg-gray-200 text-gray-400" />
          </template>
          <div>
            <div v-for="{ name } in communityList">{{ name }}</div>
          </div>
        </InfoHover>
      </div>

      <div class="w-full flex flex-col items-center">
        <Button @click="startBathCommunity">START</Button>
      </div>
    </div>


    <div id="setting-area" class="flex flex-col w-fit gap-1 p-2 border rounded">
      <div class="line">
        <span>⚙️任务设置:</span>
        <Icon v-if="isInit" icon="material-symbols:refresh" class="w-4 h-4 active:outline" @click="resetSetting"></Icon>

      </div>
      <div class="line">
        <label for="maxConcurrent">最大同时打开页面: </label>
        <Input v-model="maxConcurrent" id="maxConcurrent" type="number" class="w-24" :disabled="!isInit" />
      </div>
      <div class="line">
        <label for="retryTime">失败自动重试次数: </label>
        <Input v-model="retryTime" id="retryTime" type="number" class="w-24" :disabled="!isInit" />
      </div>
      <div class="line">
        <label for="interval">任务间隔(毫秒): </label>
        <Input v-model="interval" id="interval" type="number" class="w-24" :disabled="!isInit" />
      </div>
    </div>


    <BatchJobRunningStatusBar v-if="!isInit && communityList && batchExecutor" :executor="batchExecutor"
      :total="communityList.length" />


    <!--  running ids-->
    <div v-if="batchExecutor?.runningIds && batchExecutor?.runningIds.length > 0" class="border rounded p-2">
      正在运行中的任务:
      <TransitionGroup name="list" tag="ul" class="list-disc pl-10">
        <li v-for="id in batchExecutor.runningIds" :key="id">
          {{ id }}
        </li>
      </TransitionGroup>
    </div>


    <Alert variant="destructive" v-if="batchExecutor?.isPaused && pausedContext && pausedError">
      <Icon class="w-4 h-4" icon="material-symbols:exclamation" />
      <AlertTitle>Pause 暂停</AlertTitle>
      <AlertDescription class="flex flex-col">
        <div>
          <div @click="openUrlForHid(pausedContext.id)" class="text-green-500 underline">链接: {{ pausedContext.id }}
          </div>
        </div>
        <div>
          原因: {{ pausedError.message }}
        </div>
      </AlertDescription>
    </Alert>

    <div v-if="isFinished">
      <div class="w-full flex flex-col items-center">
        <Icon class="w-24 h-24 text-green-500" icon="weui:done2-outlined" mode="svg" />
        <div>完成!</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="postcss">
.line {
  @apply flex flex-row gap-2 items-center
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>