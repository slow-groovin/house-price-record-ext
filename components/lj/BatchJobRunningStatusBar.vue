<template>
  <div class="p-2 flex flex-col  border rounded-lg shadow  min-h-36  bg-white">
    <!--  process bar-->
    <div class="flex flex-row items-center gap-1 w-full">

      <!--      当前状态:--> <!--  status running: spin pausedL:-->
      <div class="flex-grow-0 flex-shrink-0">
        <div v-if="executor?.isRunning"
          class="w-4 h-4  rounded-full animate-spin  border-2 border-t-transparent border-green-500"></div>
        <div v-else-if="executor?.isPaused" class="rounded-full">
          <Icon class="w-4 h-4 text-yellow-800" icon="mdi:pause" mode="svg" />
        </div>
        <div v-else-if="executor?.isFinished">
          <Icon class="w-4 h-4 text-green-500" icon="weui:done2-outlined" mode="svg" />
        </div>
        <div v-else-if="executor?.isInit" class="text-green-400 italic font-bold"> Ready</div>
        <div v-else class="anim-ellipsis flex flex-row items-center"><span>.</span><span>.</span><span>.</span></div>
      </div>


      <Progress :model-value="(executor.doneCount / total) * 100" class=" bg-neutral-300 border " />
      <span class="border border-border rounded px-1">{{ executor.doneCount }}</span>
      /
      <span class="border border-black rounded px-1">{{ total }}</span>
    </div>





    <div class="flex flex-row justify-around">
      <div>已运行: {{ formatCounter }}</div>
      <div class="flex-grow"></div>
      <div v-if="executor.isRunning || executor.isPaused">
        <div class="text-sm italic"> 预计还需: {{ formatSecondsToMinutes(throttledEstimatedSeconds) }} </div>
      </div>
    </div>

    <div>
      <div> 正在运行中: {{ executor.runCount - executor.doneCount }} 个</div>
      <div> 平均耗时: {{ (executor.doneCost / executor.doneCount / 1000).toFixed(2) }} 秒</div>
      <div> <span class="text-red-400">失败数:</span> {{ executor.failedCount }} 个</div>
      <div> <span class="text-blue-400">重试次数:</span> {{ executor.retryCount }} 次</div>
    </div>
    <!--    button area-->
    <div class="flex flex-row gap-3 border-t pt-4">
      <Button v-if="executor.isRunning" @click="executor.manualPause()">
        <Icon icon="mdi:pause"></Icon>手动暂停
      </Button>
      <Button v-else-if="executor.isPaused" @click="executor.resume()">
        <Icon icon="material-symbols:play-arrow"></Icon>恢复运行
      </Button>
      <Button v-if="!executor.isFinished" @click="executor.manualForceFinish()" variant="destructive">
        <Icon icon="material-symbols:stop"></Icon>强制结束
      </Button>
    </div>
  </div>




</template>

<script setup lang="ts">
import { Progress } from '@/components/ui/progress'
import { BatchQueueExecutor } from "@/utils/lib/BatchQueueExecutor";
import { Icon } from "@iconify/vue";
import { computed, onMounted } from "vue";
import { toInt } from "radash";
import { reactify, refThrottled, useInterval } from "@vueuse/core";
import { Button } from "@/components/ui/button";


const { total, executor } = defineProps<{
  executor: BatchQueueExecutor
  total: number
}>()



const estimatedSeconds = computed(() => (total - executor.doneCount) * executor.doneCost / executor.doneCount / 1000)
const throttledEstimatedSeconds = refThrottled(estimatedSeconds, 1000)

const { counter, reset, pause, resume } = useInterval(1000, { controls: true, immediate: true })
const reactiveFormatSecondsToMinutes = reactify(formatSecondsToMinutes)
const formatCounter = reactiveFormatSecondsToMinutes(counter)

onMounted(() => {

})

executor.on('onStart', () => {
  resume()
})

executor.on('onPause', () => {
  pause()
})

executor.on('onResume', () => {
  resume()
})

executor.on('onFinished', () => {
  pause()
})






/**
 * 将秒数转换为 "X分Y秒" 格式
 * @returns 格式化后的字符串
 */
function formatSecondsToMinutes(_seconds: number): string {
  const seconds = toInt(_seconds)
  const minutes = Math.floor(seconds / 60); // 整分钟
  const remainingSeconds = seconds % 60;  // 剩余秒数
  if (minutes === 0) {
    return `${remainingSeconds}秒`;
  }
  return `${minutes}分${remainingSeconds}秒`;
}


</script>

<style scoped>
@keyframes wait-before-end {
  0% {
    transform: scale(1);
  }

  80% {
    transform: scale(1.2);
  }

  /* 动画主效果 */
  95% {
    transform: scale(1.2);
  }

  /* 保持停顿 */
  100% {
    transform: scale(1);
  }

  /* 回到原状 */
}

.anim-ellipsis span {
  animation: move 1.5s infinite;
  opacity: 0;
}

.anim-ellipsis span:nth-child(1) {
  animation-delay: 0s;
}

.anim-ellipsis span:nth-child(2) {
  animation-delay: 0.3s;
}

.anim-ellipsis span:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes move {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }

  50% {
    opacity: 1;
    transform: translateX(0);
  }

  100% {
    opacity: 0;
    transform: translateX(10px);
  }
}
</style>