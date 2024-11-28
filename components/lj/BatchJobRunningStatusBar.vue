<template>
  <div class="p-2 rounded-lg border shadow w-64 bg-white">
       <!--  process bar-->
    <div class="flex flex-row items-center gap-1 w-full">

      <!--      当前状态:--> <!--  status running: spin pausedL:-->
      <div class="flex-grow-0 flex-shrink-0">
        <div v-if="executor?.isRunning" class="w-4 h-4  rounded-full animate-spin  border-2 border-t-transparent border-green-500"></div>
        <div v-else-if="executor?.isPaused" class="rounded-full"><Icon class="w-4 h-4 text-yellow-800" icon="mdi:pause" mode="svg"/> </div>
        <div v-else-if="executor?.isFinished"><Icon class="w-4 h-4 text-green-500" icon="weui:done2-outlined" mode="svg"/> </div>
        <div v-else-if="executor?.isInit" class="text-green-400 italic font-bold"> Ready</div>

      </div>


      <Progress :model-value="(executor.doneCount/total)*100" class=" bg-neutral-300 border "/>
      <span class="border border-border rounded px-1">{{executor.doneCount}}</span>
      /
      <span class="border border-black rounded px-1">{{total}}</span>
    </div>


    <div v-if="executor?.isRunning" class="flex flex-row flex-nowrap">
      <div class="text-sm italic"> 预计还需: {{ ((total-executor.doneCount)*executor.doneCost/executor.doneCount/1000).toFixed(2) }} 秒</div>
    </div>

    <div> 正在运行中: {{executor.runCount-executor.doneCount}} 个</div>
    <div> 平均耗时: {{ (executor.doneCost/executor.doneCount/1000).toFixed(2) }} 秒</div>
    <div> <span class="text-red-400">失败数:</span> {{ executor.failedCount }} 个</div>
    <div> 重试次数: {{ executor.retryCount }} 次</div>

  </div>
</template>

<script setup lang="ts">
import {Progress} from '@/components/ui/progress'
import {BatchQueueExecutor} from "@/utils/lib/BatchQueueExecutor";
import {Icon} from "@iconify/vue";
import ex = CSS.ex;
import {ExtractPublicPropTypes} from "vue";

defineProps<{
  executor:  BatchQueueExecutor
  total:number
}>()

</script>

<style scoped>

</style>