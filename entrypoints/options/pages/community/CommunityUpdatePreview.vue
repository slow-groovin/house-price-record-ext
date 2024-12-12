<template>
  <div v-if="!isUpdateDone" class="flex flex-col items-center justify-center shadow-inner  my-4 p-3 rounded-lg border">
    <h1 class="inline">
      批量小区 xx 任务运行完成.
      <Icon icon="icon-park-outline:success" class="inline-block w-16 h-16 text-green-500"/>
    </h1>
  </div>

  <!--  更新完毕后的提示-->
  <div v-else class="flex flex-col items-center justify-center shadow-inner  my-4 p-3 rounded-lg border">
    <h1 class="inline">
      本次任务数据库更新完成! 去
<!--      todo 列表传递参数, 仅查看此次更新的内容-->
      <a :href="'options.html#/c/task/list'" class="underline text-green-500 cursor-pointer">详情页</a>
      看看吧!
      <Icon icon="icon-park-outline:success" class="inline-block w-16 h-16 text-green-500"/>
    </h1>
    <Button variant="destructive" @click="closeWindow()">关闭窗口</Button>
  </div>



  <div v-if="data" :class="cn('flex flex-col space-y-6', props.class)">


    <div v-if="!isUpdateDone"  class="flex flex-col space-y-2">
      <h2 class="text-xl font-semibold">请查看确认任务结果清单</h2>
      <div class="text-sm  text-gray-600 ">
        ID: {{ data.batchId }}
        <div class="inline-block min-w-32"> &nbsp;</div>
        时间: {{ new Date(data.at).toLocaleString() }}
      </div>
      <h3 class="text-sm font-light italic">确认无误后, 点击下方按钮开始存入浏览器数据库</h3>
      <h3 class="text-sm font-light italic">可以点击按钮, 手动标记删除有误记录</h3>
      <h3 class="text-sm font-light italic">记录会以周为单位进行存储</h3>
<!--      todo: hoverInfo介绍周为单位存储的原理-->

      <h3 class="text-sm font-light italic"></h3>
    </div>
    <h2 v-else class="text-xl font-semibold">已更新</h2>


    <div v-if="data.records.length > 0" class="flex flex-col space-y-2">
      <ul class="flex flex-col gap-3">
        <li v-for="(item,index) in data.records" :key="item.cid"
            class="text-sm  flex flex-row items-start gap-3"
            :class="{'line-through': listDelete[index]}"
        >
          <CommunityRecordCard :record="item"/>
          <Component :is="DeleteResumeBtn(listDelete,index)"/>

        </li>
      </ul>
    </div>


    <div v-if="!isUpdateDone">
<!--      todo stick 浮动-->
      <Button @click="mutate" :disabled="status!=='idle'">
        <div v-if="status==='pending'"
          class="w-4 h-4 rounded-full animate-spin  border-2 border-t-transparent border-green-500"></div>
        确认数据
      </Button>
    </div>
    <div v-if="error">{{error}}</div>
  </div>
</template>

<script setup lang="tsx">
import {HTMLAttributes, ref, toRaw} from 'vue'
import {cn} from "@/utils/shadcn-utils";
import {Icon} from "@iconify/vue";
import {useRoute} from "vue-router";
import {db} from "@/utils/client/Dexie";
import {CommunityUpdatePreview} from "@/types/LjUpdatePreview";
import {Button} from "@/components/ui/button";
import {updateBatchHouseWithPreview} from "@/entrypoints/reuse/house-update";
import {useMutation} from "@tanstack/vue-query";
import CommunityRecordCard from "@/entrypoints/options/components/CommunityRecordCard.vue";
import {updateBatchCommunityWithPreview} from "@/entrypoints/reuse/community-update";
import {browser} from "wxt/browser";

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const {query: {id}} = useRoute()
const data = ref<CommunityUpdatePreview>()
if (id)
  db.tempCommunityUpdatePreview.get(id as string).then(rs => data.value = rs)

const isUpdateDone = ref(false)

const listDelete = ref<Record<number, boolean>>({})



const DeleteResumeBtn = (deleteMap: Record<number, boolean>, index: number) =>
  <div class="hover:bg-gray-200 hover:outline outline-1 hover:cursor-pointer">

    {deleteMap[index] &&
      <button onClick={() => delete deleteMap[index]}><Icon icon="material-symbols:undo" class="text-blue-400 w-5 h-5"/>
      </button>
    }
    {!deleteMap[index] &&
      <button onClick={() => deleteMap[index] = true}><Icon icon="gg:remove" class="text-red-400 w-5 h-5"/></button>
    }

  </div>

const {mutate, status, isError, error} = useMutation({
  mutationKey: ['update-preview'],
  mutationFn: doUpdate,
})

async function doUpdate() {
  if (!data.value) {
    alert('出现错误, 更新数据不存在!')
    return
  }
  const previewData = {
    batchId: data.value.batchId,
    at: data.value.at,
    records: data.value.records.filter((_, index) => !listDelete.value[index]).map(r=>toRaw(r))
  }

  console.log(previewData)


  await updateBatchCommunityWithPreview(previewData)
  isUpdateDone.value = true
  // 滚动到页面顶部
  window.scrollTo({top: 0, behavior: 'smooth'});
}

async function closeWindow(){
  const curWindow=await browser.windows.getCurrent()
  await browser.windows.remove(curWindow.id as number)
}
</script>