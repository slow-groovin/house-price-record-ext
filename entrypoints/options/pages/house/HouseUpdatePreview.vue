<template>
  <div v-if="!isUpdateDone" class="flex flex-col items-center justify-center shadow-inner  my-4 p-3 rounded-lg border">
    <h1 class="inline">
      批量房源查看任务运行完成.
      <Icon icon="icon-park-outline:success" class="inline-block w-16 h-16 text-green-500" />
    </h1>
  </div>

  <!--  更新完毕后的提示-->
  <div v-else class="flex flex-col items-center justify-center shadow-inner  my-4 p-3 rounded-lg border">
    <h1 class="inline">
      本次任务数据库更新完成! 去列表看看吧!
      <Icon icon="icon-park-outline:success" class="inline-block w-16 h-16 text-green-500" />
    </h1>
  </div>

  <div v-if="data" :class="cn('relative flex flex-col space-y-6', props.class)">


    <div class="flex flex-col space-y-2">
      <h2 class="text-xl font-semibold">请确认查看结果清单</h2>
      <div class="text-sm  text-gray-600 ">
        ID: {{ data.batchId }}
        <div class="inline-block min-w-32"> &nbsp;</div>
        时间: {{ formatDate(data.at) }}
      </div>
      <h3 class="text-sm font-light italic">确认无误后, 点击下方按钮开始存入浏览器数据库</h3>
      <h3 class="text-sm font-light italic">如果确认某条数据有误, 可以点击按钮标记删除, 该条记录不会进行更新</h3>
    </div>

    <div v-if="failedList.length > 0" class="flex flex-col space-y-2">
      <ul class="flex flex-col gap-3">
        <li v-for="(id, index) in failedList" :key="id" class="text-sm   flex flex-row items-center gap-3">
          <div class="text-center flex items-center text-red-300 ">
            运行失败
            <InfoHover>该项任务在本次批量运行中,运行失败,没有结果数据, 确认更新不会处理此项</InfoHover>
          </div>
          <a :href="'options.html#/h/task/detail?id=' + id" target="_blank" class="text-green-500 underline">
            {{ id }}
          </a>

        </li>
      </ul>
    </div>

    <div v-if="data.miss.length > 0" class="flex flex-col space-y-2">
      <ul class="flex flex-col gap-3">
        <li v-for="(item, index) in data.miss" :key="item.hid" class="text-sm  flex flex-row items-center gap-3"
          :class="{ 'line-through': missDelete[index] }">
          <a :href="'options.html#/h/task/detail?id=' + item.hid" target="_blank" class="text-green-500 underline">
            {{ item.hid }}
          </a>
          <div class="text-center">
            下架
            <Icon icon="mdi:hide" class="inline-block" />
          </div>
          <Component :is="DeleteResumeBtn(missDelete, index)" />

        </li>
      </ul>
    </div>


    <div v-if="data.sold.length > 0" class="flex flex-col space-y-2">
      <ul class="flex flex-col gap-3">
        <li v-for="(item, index) in data.sold" :key="item.hid" class="text-sm  flex flex-row items-center gap-3"
          :class="{ 'line-through': soldDelete[index] }">
          <a :href="'options.html#/h/task/detail?id=' + item.hid" target="_blank" class="text-green-500 underline">
            {{ item.hid }}
          </a>
          <div class="text-center">
            已售出成交
            <Icon icon="bi:cart-check-fill" class="inline-block" />
          </div>
          <Component :is="DeleteResumeBtn(soldDelete, index)" />
        </li>
      </ul>
    </div>

    <div v-if="data.normal.length > 0" class="flex flex-col space-y-2">
      <div v-for="(item, index) in data.normal" :key="item.hid" class="flex flex-row gap-2 items-center"
        :class="{ 'line-through': normalDelete[index] }">
        <a :href="'options.html#/h/task/detail?id=' + item.hid" target="_blank" class="text-green-500 underline">
          {{ item.hid }}
        </a>

        <span>在售</span>

        <p v-if="item.newPrice"
          class="text-sm text-nowrap text-green-500 bg-neutral-100 border rounded hover:cursor-help" title="之前状态不是[在售]">
          新状态: 在售</p>

        <p v-if="item.newPrice" class="text-sm text-nowrap text-green-700 bg-neutral-100 border rounded">新价格:
          {{ item.newPrice }}
          万元</p>


        <div v-if="item.updateChanges && item.updateChanges.length">
          <span class="text-nowrap">更新字段:</span>
          <div class="mt-2 flex flex-row overflow-x-auto items-center gap-1  text-sm">
            <Component :is="Badge(key, value)" v-for="(value, key) in item.updateChanges" :key="key" />
          </div>
        </div>
        <div v-else class="bg-neutral-300 rounded">
          无字段变更
        </div>

        <Component :is="DeleteResumeBtn(normalDelete, index)" />
      </div>
    </div>


    <div class="w-full h-16"></div>
    <div v-if="!isUpdateDone" class="sticky bottom-12">
      <Button @click="mutate" :disabled="status !== 'idle'">
        <div v-if="status === 'pending'"
          class="w-4 h-4 rounded-full animate-spin  border-2 border-t-transparent border-green-500"></div>
        确认数据
      </Button>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { HTMLAttributes, onMounted, ref } from 'vue'
import { cn } from "@/utils/shadcn-utils";
import { Icon } from "@iconify/vue";
import { useRoute } from "vue-router";
import { db } from "@/utils/client/Dexie";
import { HousesUpdatePreview } from "@/types/LjUpdatePreview";
import { Button } from "@/components/ui/button";
import { updateBatchHouseWithPreview } from "@/entrypoints/reuse/house-update";
import { useMutation } from "@tanstack/vue-query";
import { useExtTitle } from "@/composables/useExtInfo";
import InfoHover from "@/components/information/InfoHover.vue";
import { sleep } from 'radash';
import { usePreventUnload } from '@/utils/browser';

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const { query: { id } } = useRoute()
useExtTitle('房源任务运行结果确认预览' + id)

const data = ref<HousesUpdatePreview>()
const batchListData = ref<{ id?: number, hidList: string[] }>()
const isUpdateDone = ref(false)

const missDelete = ref<Record<number, boolean>>({})
const normalDelete = ref<Record<number, boolean>>({})
const soldDelete = ref<Record<number, boolean>>({})

const failedList = ref<string[]>([])


async function queryData() {
  if (id) {
    await db.tempHouseUpdatePreview.get(id as string).then(rs => data.value = rs)
    if (data.value) {
      if (data.value.tempListId) {
        batchListData.value = await db.tempBatchHouse.get(data.value.tempListId)
      }

      const missIds = data.value.miss.map(item => item.hid)
      const normalIds = data.value.normal.map(item => item.hid)
      const soldIds = data.value.sold.map(item => item.hid)
      const inputIds = new Set<string>(batchListData.value?.hidList ?? [])
      const hasResultIds = new Set<string>(missIds.concat(normalIds, soldIds))
      failedList.value = new Array(...inputIds.difference(hasResultIds))
    }
  }
}


const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}


const Badge = (key: string, value: string) =>
  <div class="flex items-center border border-black rounded">
    <span class="bg-gray-300 text-gray-800 text-xs font-medium px-1 ">{key}:</span>
    <span class="text-gray-900 text-xs px-1 font-semibold truncate max-w-[100px]" title={value}>
      {value}
    </span>
  </div>

const DeleteResumeBtn = (deleteMap: Record<number, boolean>, index: number) =>
  <div class="hover:bg-gray-200 hover:outline outline-1 hover:cursor-pointer">
    {deleteMap[index] && <Icon onClick={() => delete deleteMap[index]} icon="material-symbols:undo"
      class="text-blue-400 w-5 h-5" />}
    {!deleteMap[index] &&
      <Icon onClick={() => deleteMap[index] = true} icon="gg:remove" class="text-red-400 w-5 h-5" />}
  </div>

const { mutate, status, isError, error } = useMutation({
  mutationKey: ['update-preview'],
  mutationFn: doUpdate,
})



async function doUpdate() {
  if (!data.value) {
    alert('出现错误, 更新数据不存在!')
    return
  }

  const { preventUnload, cancelPreventUnload } = usePreventUnload()
  preventUnload()

  const previewData = {
    at: data.value.at,
    batchId: data.value.batchId,
    tempListId: data.value.tempListId,
    miss: data.value.miss.filter((item, index) => !missDelete.value[index]),
    normal: data.value.normal.filter((item, index) => !normalDelete.value[index]),
    sold: data.value.sold.filter((item, index) => !soldDelete.value[index]),
  }

  await updateBatchHouseWithPreview(previewData)
  isUpdateDone.value = true
  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
  cancelPreventUnload()
}

onMounted(() => {
  queryData()
})

</script>