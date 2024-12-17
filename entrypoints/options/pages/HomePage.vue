<script setup lang="ts">
import {db} from "@/utils/client/Dexie";
import {onMounted, ref} from "vue";
import {Separator} from "@/components/ui/separator";
import {formatDistanceStrict, formatDistanceToNow} from 'date-fns'
import {getIndexedDBUsage} from "@/utils/browser";
import {zhCN} from "date-fns/locale/zh-CN";
const extName = import.meta.env.VITE_EXT_NAME

const cTaskCount = ref(0)
const hTaskCount = ref(0)
const pChangeCount = ref(0)
const sChangeCount = ref(0)
const cRecordCount = ref(0)
const usedMb=ref(0)
const lastAt = ref(0)

async function queryOverviewData() {
  cTaskCount.value = await db.communityTasks.count()
  hTaskCount.value = await db.houseTasks.count()
  pChangeCount.value = await db.houseChanges.count()
  sChangeCount.value = await db.houseStatusChanges.count()
  cRecordCount.value = await db.communityRecords.count()

  const cLastAt = (await db.communityTasks.orderBy('lastRunningAt').last())?.lastRunningAt
  const hLastAt = (await db.houseTasks.orderBy('lastRunningAt').last())?.lastRunningAt
  lastAt.value = Math.max(cLastAt || 0, hLastAt || 0)
}

onMounted(() => {
  queryOverviewData()
  getIndexedDBUsage().then(rs=>{
    usedMb.value=rs.usage
  })
})
</script>

<template>


  <div class="w-full my-8 font-bold text-2xl text-center">
    欢迎使用 {{ extName }}
  </div>


  <div class="grid grid-cols-9 grid-rows-9 auto-rows-auto grid-flow-row gap-9">
    <!--    上次运行-->
    <div v-if="lastAt" class="col-span-3 outline rounded text-nowrap min-w-fit p-2 ">
      距离上次运行任务
      <span class="text-green-500"> {{ new Date(lastAt).toLocaleString() }}</span>
      已过去 <span class="text-green-500"> {{ formatDistanceToNow(lastAt, {locale:zhCN}) }}</span>
    </div>


    <!--    使用入门-->
    <div class="outline  outline-green-500 rounded p-2">
      使用入门
      <a class="link" href="/options.html#/startup">去查看></a>
    </div>


    <!--    数据看板-->
    <div class="outline col-start-1 row-span-6 w-fit text-nowrap outline-green-500 rounded">
      <h1 class="font-bold text-2xl m-2">数据看板</h1>
      <Separator class="w-full"/>
      <div class="p-2 pr-8">
        截至今天, 您已:
        <div>
          <div>
            添加<span class="text-green-500 font-bold m-1">小区</span>任务数量:
            <span class="font-bold text-amber-500">{{ cTaskCount }}</span>个
            <a href="/options.html#/c/task/list" class="link ml-16 text-right">去查看></a>
          </div>

          <div>
            添加<span class="text-green-500 font-bold m-1">单房源</span>任务数量:
            <span class="font-bold text-amber-500">{{ hTaskCount }}</span>个
            <a href="/options.html#/h/task/list" class="link ml-16">去查看></a>
          </div>

          <div>
            追踪<span class="text-green-500 font-bold m-1">房源价格变更</span>次数:
            <span class="font-bold text-amber-500">{{ pChangeCount }}</span>个
            <a href="/options.html#/h/task/change" class="link ml-16">去查看></a>
          </div>

          <div>
            追踪<span class="text-green-500 font-bold m-1">房源状态变更</span>次数:
            <span class="font-bold text-amber-500">{{ sChangeCount }}</span>个
            <a href="/options.html#/h/task/status/change" class="link ml-16">去查看></a>
          </div>

          <div>
            存入<span class="text-green-500 font-bold m-1">小区记录</span>数量:
            <span class="font-bold text-amber-500">{{ cRecordCount }}</span>个
          </div>

          <div>
            <span class="text-green-500 font-bold m-1">总数据大小</span>:
            <span class="font-bold text-amber-500">{{ usedMb.toFixed(2) }}</span>MB
          </div>
        </div>
      </div>

    </div>


  </div>
</template>

<style scoped>

</style>