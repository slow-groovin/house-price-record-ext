<script setup lang="ts">
import { db } from "@/entrypoints/db/Dexie";
import { computed, onMounted, reactive, ref } from "vue";
import { formatDistanceToNow, startOfWeek } from 'date-fns'
import { getIndexedDBUsage } from "@/utils/browser";
import { zhCN } from "date-fns/locale/zh-CN";
import { useExtInfo, useExtTitle } from "@/composables/useExtInfo";
import { Archive, Building2, EyeOffIcon, HardDrive, HouseIcon, ShoppingCartIcon, TrendingDownIcon, TrendingUpIcon } from 'lucide-vue-next'
import { browser } from "wxt/browser";
import { ljMetricRules } from "@/entrypoints/reuse/block";
import InfoHover from "@/components/information/InfoHover.vue";
import { HouseTask, HouseTaskStatus } from "@/types/lj";

useExtTitle('首页')
const { name, version } = useExtInfo()


const totalCount = reactive({
  cTaskCount: 0,
  hTaskCount: 0,
  pChangeCount: 0,
  sChangeCount: 0,
  cRecordCount: 0,
  usedMb: 0,
})
const thisWeekCount = reactive({
  cTaskCount: 0,
  hTaskCount: 0,
  // pChangeCount: 0,
  pUpCount: 0,
  pDownCount: 0,

  // sChangeCount: 0,
  sAddedCount: 0,
  sRemovedCount: 0,
  cRecordCount: 0,
})
const enableRulesCount = ref(0)
const allRulesCount = ref(0)

const lastAt = ref(0)
const weekStartAt = ref(0)

async function queryOverviewData() {
  totalCount.cTaskCount = await db.communityTasks.count()
  totalCount.hTaskCount = await db.houseTasks.count()
  totalCount.pChangeCount = await db.houseChanges.count()
  totalCount.sChangeCount = await db.houseStatusChanges.count()
  totalCount.cRecordCount = await db.communityRecords.count()

  const cLastAt = (await db.communityTasks.orderBy('lastRunningAt').last())?.lastRunningAt
  const hLastAt = (await db.houseTasks.orderBy('lastRunningAt').last())?.lastRunningAt
  lastAt.value = Math.max(cLastAt || 0, hLastAt || 0)

  weekStartAt.value = startOfWeek(new Date(), { weekStartsOn: 1 }).getTime()
  thisWeekCount.cTaskCount = await db.communityTasks.where('createdAt').above(weekStartAt.value).count()

  thisWeekCount.hTaskCount = await db.houseTasks.where('createdAt').above(weekStartAt.value).count()
  // thisWeekCount.pChangeCount = await db.houseChanges.where('at').above(weekStartAt.value).count()
  thisWeekCount.pUpCount = await db.houseChanges.where('at').above(weekStartAt.value).and(item => item.newValue > item.oldValue).count()
  thisWeekCount.pDownCount = await db.houseChanges.where('at').above(weekStartAt.value).and(item => item.newValue < item.oldValue).count()

  // thisWeekCount.sChangeCount = await db.houseStatusChanges.where('at').above(weekStartAt.value).count()
  thisWeekCount.sAddedCount = await db.houseStatusChanges.where('at').above(weekStartAt.value).and(item => item.newValue === HouseTaskStatus.running).count()
  thisWeekCount.sRemovedCount = await db.houseStatusChanges.where('at').above(weekStartAt.value).and(item => item.newValue === HouseTaskStatus.miss || item.newValue === HouseTaskStatus.sold).count()
  thisWeekCount.cRecordCount = await db.communityRecords.where('at').above(weekStartAt.value).count()
}

async function loadRules() {
  const _rules = await browser.declarativeNetRequest.getDynamicRules()
  enableRulesCount.value = _rules.length
  allRulesCount.value = ljMetricRules.length
}

const isEmptyUsage = computed(() => totalCount.cTaskCount === 0 && totalCount.hTaskCount === 0)


const display = {
  cTaskCount: { label: '小区任务', icon: Building2, color: 'blue', link: '/options.html#/c/task/list', postfix: '个' },
  hTaskCount: { label: '房源任务', icon: HouseIcon, color: 'blue', link: '/options.html#/h/task/list', postfix: '个' },
  pChangeCount: {
    label: '价格变更记录',
    icon: TrendingDownIcon,
    color: 'green',
    link: '/options.html#/h/task/change',
    postfix: '条'
  },

  pUpCount: {
    label: '房源涨价记录',
    icon: TrendingUpIcon,
    color: 'red',
    link: '/options.html#/h/task/change',
    postfix: '条'
  },


  pDownCount: {
    label: '房源降价记录',
    icon: TrendingDownIcon,
    color: 'green',
    link: '/options.html#/h/task/change',
    postfix: '条'
  },

  sChangeCount: {
    label: '状态变更记录',
    icon: ShoppingCartIcon,
    color: 'red',
    link: '/options.html#/h/task/status/change',
    postfix: '条'
  },
  sAddedCount: {
    label: '房源上架记录',
    icon: ShoppingCartIcon,
    color: 'blue',
    link: '/options.html#/h/task/status/change',
    postfix: '条'
  },
  sRemovedCount: {
    label: '房源下架/成交记录',
    icon: EyeOffIcon,
    color: 'gray',
    link: '/options.html#/h/task/status/change',
    postfix: '条'
  },

  cRecordCount: { label: '小区运行记录', icon: Archive, color: 'purple', link: '#', postfix: '个' },
  usedMb: { label: '数据总量', icon: HardDrive, color: 'gray', link: '#', postfix: 'MB' }
}

onMounted(() => {
  loadRules()
  queryOverviewData()
  getIndexedDBUsage().then(rs => {
    totalCount.usedMb = Number(rs.usage.toPrecision(2))
  })
})
</script>

<template>


  <h1 class="w-full flex items-center justify-center my-8 font-bold text-2xl text-center">
    欢迎使用
    <span class="bg-gradient-to-r from-primary via-lime-500 to-blue-500 text-transparent bg-clip-text w-fit">
      {{ name }}{{ version }}
    </span> <img src="/icon/24.png" alt="icon" class="inline">
  </h1>
  <div v-if="isEmptyUsage" class="flex flex-col gap-2">
    首次使用? 请查看
    <!--    使用入门-->
    <div class="outline w-fit h-fit  outline-green-500 rounded p-2">
      操作指南
      <a class="link" href="/options.html#/startup">去查看></a>
    </div>

    <div class="outline col-span-3  w-fit h-fit outline-green-500 rounded p-2">
      当前已经激活 <span class="font-extrabold text-green-500">{{ enableRulesCount }}</span>/{{ allRulesCount }} 条请求过滤规则
      <a class="link" href="/options.html#/blocks">去查看></a>
      <InfoHover>如果您在访问本插件目标站点时遇到了无法排查的网络访问问题, 请尝试关闭规则进行排查</InfoHover>
    </div>
  </div>

  <div v-if="!isEmptyUsage" class="grid grid-cols-9 grid-rows-9 auto-rows-auto grid-flow-row gap-9">
    <div class="flex flex-row flex-wrap gap-2 col-span-full row-span-1 h-fit">
      <!--    上次运行-->
      <div v-if="lastAt" class=" h-fit outline rounded  min-w-fit p-2 ">
        距离上次运行任务
        <span class="text-green-500"> {{ new Date(lastAt).toLocaleString() }}</span>
        已过去 <span class="text-green-500"> {{ formatDistanceToNow(lastAt, { locale: zhCN }) }}</span>
      </div>

      <div class="outline   w-fit h-fit outline-green-500 rounded p-2">
        当前已经激活 <span class="font-extrabold text-green-500">{{ enableRulesCount }}</span>/{{ allRulesCount }}
        条请求过滤规则
        <a class="link" href="/options.html#/blocks">去查看></a>
        <InfoHover>如果您在访问本插件目标站点时遇到了无法排查的网络访问问题, 请尝试关闭规则进行排查</InfoHover>
      </div>


      <!--    使用入门-->
      <div class="outline h-fit   outline-green-500 rounded p-2">
        使用详情
        <a class="link" href="/options.html#/startup-detail">去查看></a>
      </div>

    </div>

    <div class="col-start-1 col-span-8 row-span-3 bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">本周新增数据概览</h2>
      <h3 class="mb-4">从 {{ new Date(weekStartAt).toLocaleString() }} 到当前, 新增:</h3>

      <div class="flex flex-wrap mx-3">
        <div v-for="(value, key) in thisWeekCount" :key="key" class="px-3 mb-6">
          <div class="bg-white rounded-lg shadow p-6 flex items-center">
            <div :class="`mr-4`" :style="{ color: display[key].color }">
              <component :is="display[key].icon" class="w-8 h-8" />
            </div>
            <div>
              <p class="text-sm text-gray-600">{{ display[key].label }}</p>
              <p class="text-2xl font-semibold text-gray-800">{{ value }}<span>{{ display[key]?.postfix }}</span></p>

            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-span-7 row-span-3 min-w-fit bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 class="text-2xl font-bold text-gray-800 mb-6">数据面板</h2>
      <h3 class="mb-4">截至今天, 您已添加:</h3>

      <div class="flex flex-wrap -mx-3">
        <div v-for="(value, key) in totalCount" :key="key" class="px-3 mb-6">
          <div class="bg-white rounded-lg shadow p-6 flex items-center">
            <div :class="`mr-4`" :style="{ color: display[key].color }">
              <component :is="display[key].icon" class="w-8 h-8" />
            </div>
            <div>
              <p class="text-sm text-gray-600">{{ display[key].label }}</p>
              <a class="text-2xl font-semibold hover-link text-gray-800" :href="display[key].link">{{
                value
              }}<span>{{ display[key]?.postfix }}</span></a>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>

</template>

<style scoped></style>