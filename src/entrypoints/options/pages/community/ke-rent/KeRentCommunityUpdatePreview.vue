<template>
  <div class="relative">
    <div v-if="!isUpdateDone"
      class="flex flex-col items-center justify-center shadow-inner  my-4 p-3 rounded-lg border">
      <h1 class="inline">
        批量任务运行任务(小区)完成.
        <Icon icon="icon-park-outline:list-success" class="inline-block size-12 text-blue-500" mode="svg" />
      </h1>
    </div>

    <!--  更新完毕后的提示-->
    <div v-else class=" flex flex-col items-center justify-center shadow-inner  my-4 p-3 rounded-lg border gap-4">
      <h1 class="inline">
        本次任务数据库更新完成!
        <Icon icon="icon-park-outline:success" class="inline-block size-12 text-green-500" />
      </h1>
      <div class="flex flex-row items-center justify-between gap-4">

        <a :href="'options.html#/c/task/list'" class="underline text-green-500 cursor-pointer">
          <Button variant="outline">
            返回列表
          </Button>
        </a>
        <div v-if="addedItem.length">
          <Button @click="goRunAddedHouseTasks">对本次新增房源运行房源任务(共 {{ addedItem.length }} 个)</Button>
          <HouseFieldsLackDesc />
        </div>
        <Button variant="destructive" @click="closeWindow()">关闭窗口</Button>

      </div>
    </div>


    <div v-if="data" :class="cn('flex flex-col space-y-6', props.class)">

      <div v-if="!isUpdateDone" class="flex flex-col space-y-2">
        <h2 class="text-xl font-semibold">请查看确认任务结果清单</h2>
        <div class="text-sm  text-gray-600 ">
          ID: {{ data.batchId }}
          <div class="inline-block min-w-32"> &nbsp;</div>
          时间: {{ new Date(data.at).toLocaleString() }}
        </div>
        <h3 class="text-sm font-light italic">确认无误后, 点击下方按钮开始存入浏览器数据库</h3>
        <h3 class="text-sm font-light italic">可以点击按钮, 手动标记删除有误记录</h3>
        <h3 class="text-sm font-light italic">记录会以周为周期进行存储
          <InfoHover>
            如果某个小区任务已经存在一条本周一0:00之后的记录, 新的记录会和这条记录进行合并
          </InfoHover>
        </h3>


        <h3 class="text-sm font-light italic"></h3>
      </div>
      <h2 v-else class="text-xl font-semibold">已更新</h2>


      <template v-if="failedList.length > 0">
        <ul>
          <li v-for="(item, index) in failedList" :key="item.cid"
            class="text-sm  flex flex-row items-center gap-3  w-fit  border"
            :class="{ 'line-through': listDelete[index] }">
            <div class="text-center flex items-center text-red-600 ">
              <InfoHover>该项任务在本次批量运行中,运行失败,没有结果数据, 确认数据时不会处理此项</InfoHover>
              运行失败
            </div>
            <a class="link" :href="`options.html#/c/task/detail?id=${item.cid}`">{{ item.cid }}</a>
            <a class="link flex items-center" :href="genCommunityPageUrl(item.city ?? '', item.cid, 1)">{{ item.name }}
              <Icon icon="tdesign:jump" />
            </a>
          </li>
        </ul>
      </template>
      <template v-if="data.records.length > 0">
        <ul class="flex flex-col gap-3">
          <li v-for="(item, index) in data.records" :key="item.cid" class="text-sm  flex flex-row items-start gap-3"
            :class="{ 'line-through': listDelete[index] }">
            <CommunityRecordCard :record="item" />
            <Component :is="DeleteResumeBtn(listDelete, index)" />

          </li>
        </ul>
      </template>

    </div>
    <Button v-if="!isUpdateDone && data?.records?.length" @click="mutate" :disabled="status !== 'idle'"
      class="my-4 sticky bottom-12 ">
      <div v-if="status === 'pending'"
        class="w-4 h-4 rounded-full animate-spin  border-2 border-t-transparent border-green-500"></div>
      确认数据
    </Button>
    <div v-else-if="!data?.records?.length">
      <div>没有数据</div>
      <Button @click="closeWindow" variant="outline">关闭网页</Button>
    </div>

    <div v-if="error">{{ error }}</div>

  </div>
</template>

<script setup lang="tsx">
import InfoHover from "@/components/information/InfoHover.vue";
import { Button } from "@/components/ui/button";
import { useExtTitle } from "@/composables/useExtInfo";
import CommunityRecordCard from "@/entrypoints/options/components/CommunityRecordCard.vue";
import { updateBatchCommunityWithPreview } from "@/entrypoints/reuse/community-update";
import { goRunHouseTasksStartPage } from '@/entrypoints/reuse/house-control2';
import { CommunityTask } from "@/types/lj";
import { CommunityUpdatePreview } from "@/types/LjUpdatePreview";
import { usePreventUnload } from '@/utils/browser';
import { db } from "@/entrypoints/db/Dexie";
import { genCommunityPageUrl } from "@/utils/lj-url";
import { cn } from "@/utils/shadcn-utils";
import { Icon } from "@iconify/vue";
import { useMutation } from "@tanstack/vue-query";
import { HTMLAttributes, onMounted, ref, toRaw } from 'vue';
import { useRoute } from "vue-router";
import { browser } from "wxt/browser";
import { HousePriceItem } from '../../../../types/lj';
import HouseFieldsLackDesc from '../../components/description/HouseFieldsLackDesc.vue';

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const { query: { id } } = useRoute()
useExtTitle('小区任务运行结果确认预览' + id)

const data = ref<CommunityUpdatePreview>()
const initialBatchList = ref<CommunityTask[]>([])
const failedList = ref<CommunityTask[]>([])
/**
 * 本次更新结果中, 所有新增的房源
 */
const addedItem = ref<HousePriceItem[]>([])
async function queryData() {
  if (id) {
    await db.tempCommunityUpdatePreview.get(id as string).then(rs => data.value = rs)
  }
  console.log('data.value', data.value)
  if (data.value) {
    initialBatchList.value = (await db.tempBatchCommunity.get(data.value.tempListId))?.communityList ?? []
    let sucIds = data.value.records.map(r => r.cid);

    const allIds = new Set(initialBatchList.value.map(r => r.cid))
    const failedIds = allIds.difference(new Set(sucIds))
    failedList.value = initialBatchList.value.filter(r => failedIds.has(r.cid))
  }
}


const isUpdateDone = ref(false)

const listDelete = ref<Record<number, boolean>>({})


const DeleteResumeBtn = (deleteMap: Record<number, boolean>, index: number) =>
  <div class="hover:bg-gray-200 hover:outline outline-1 hover:cursor-pointer">

    {deleteMap[index] &&
      <button onClick={() => delete deleteMap[index]}><Icon icon="material-symbols:undo" class="text-blue-400 w-5 h-5" />
      </button>
    }
    {!deleteMap[index] &&
      <button onClick={() => deleteMap[index] = true}><Icon icon="gg:remove" class="text-red-400 w-5 h-5" /></button>
    }

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
    batchId: data.value.batchId,
    tempListId: data.value.tempListId,
    at: data.value.at,
    records: data.value.records.filter((_, index) => !listDelete.value[index]).map(r => toRaw(r))
  }

  // console.log(previewData)


  const { addedItem: _addedItem } = await updateBatchCommunityWithPreview(previewData)
  addedItem.value = _addedItem

  isUpdateDone.value = true
  // 滚动到页面顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
  cancelPreventUnload()
}

async function goRunAddedHouseTasks() {
  const addedHids = addedItem.value.map(item => item.hid)
  goRunHouseTasksStartPage(addedHids)
}

async function closeWindow() {
  const curWindow = await browser.windows.getCurrent()
  await browser.windows.remove(curWindow.id as number)
}

onMounted(() => {
  queryData()
})

</script>