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
import UpdateHint from "../../components/description/UpdateHint.vue";
import { KeRentDao } from "@/entrypoints/db/rent-dao";

useExtTitle('(租房)首页')


const totalCount = reactive({
  cTaskCount: 0,
  hTaskCount: 0,
  pChangeCount: 0,
  sChangeCount: 0,
  cRecordCount: 0,
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


const lastAt = ref(0)
const weekStartAt = ref(0)

async function queryOverviewData() {
  totalCount.cTaskCount = await KeRentDao().countCommunity()
  totalCount.hTaskCount = await KeRentDao().countHoues()
  totalCount.pChangeCount = await KeRentDao().countChanges({ type: 'price' })
  totalCount.sChangeCount = await KeRentDao().countChanges({ type: 'status' })
  totalCount.cRecordCount = await KeRentDao().countCommunity()

  const cLastAt = (await KeRentDao().findManyCommunities({ pageIndex: 1, pageSize: 1 }, {}, { field: 'lastRunningAt', order: 'desc' })).data[0]?.lastRunningAt
  lastAt.value = cLastAt || 0

  weekStartAt.value = startOfWeek(new Date(), { weekStartsOn: 1 }).getTime()
  thisWeekCount.cTaskCount = await KeRentDao().countCommunity({ createdAtMin: weekStartAt.value })

  thisWeekCount.hTaskCount = await KeRentDao().countHoues({ createdAtMin: weekStartAt.value })
  thisWeekCount.pUpCount = await KeRentDao().countChanges({ type: 'price', priceType: 'up', atMin: weekStartAt.value })
  thisWeekCount.pDownCount = await KeRentDao().countChanges({ type: 'price', priceType: 'down', atMin: weekStartAt.value })

  thisWeekCount.sAddedCount = await KeRentDao().countChanges({ type: 'status', statusType: 'added', atMin: weekStartAt.value })
  thisWeekCount.sRemovedCount = await KeRentDao().countChanges({ type: 'status', statusType: 'removed', atMin: weekStartAt.value })
  thisWeekCount.cRecordCount = await KeRentDao().countCommunity({ createdAtMin: weekStartAt.value })
}


const isEmptyUsage = computed(() => totalCount.cTaskCount === 0 && totalCount.hTaskCount === 0)


const display = {
  cTaskCount: { label: '小区任务', icon: Building2, color: 'blue', link: '/options.html#/rent/c/task/list', postfix: '个' },
  hTaskCount: { label: '房源记录', icon: HouseIcon, color: 'blue', link: '/options.html#/rent/h/task/list', postfix: '个' },
  pChangeCount: {
    label: '价格变更记录',
    icon: TrendingDownIcon,
    color: 'green',
    link: '/options.html#/rent/h/task/change',
    postfix: '条'
  },

  pUpCount: {
    label: '涨价记录',
    icon: TrendingUpIcon,
    color: 'red',
    link: '/options.html#/rent/h/task/change',
    postfix: '条'
  },


  pDownCount: {
    label: '降价记录',
    icon: TrendingDownIcon,
    color: 'green',
    link: '/options.html#/rent/h/task/change',
    postfix: '条'
  },

  sChangeCount: {
    label: '状态变更记录',
    icon: ShoppingCartIcon,
    color: 'red',
    link: '/options.html#/rent/h/task/status/change',
    postfix: '条'
  },
  sAddedCount: {
    label: '上架记录',
    icon: ShoppingCartIcon,
    color: 'blue',
    link: '/options.html#/rent/h/task/status/change',
    postfix: '条'
  },
  sRemovedCount: {
    label: '下架记录',
    icon: EyeOffIcon,
    color: 'gray',
    link: '/options.html#/rent/h/task/status/change',
    postfix: '条'
  },

  cRecordCount: { label: '小区任务运行记录', icon: Archive, color: 'purple', link: '#', postfix: '个' },
}

onMounted(() => {
  queryOverviewData()
})
</script>

<template>

  <h1 class=" my-8 font-bold text-4xl ">
    租房
  </h1>
  <div v-if="isEmptyUsage" class="flex flex-col gap-2">
    首次使用? 请查看:
    <!--    使用入门-->
    <div class="outline w-fit h-fit  outline-green-500 rounded p-2">
      操作指南
      <a class="link" href="/options.html#/startup">去查看></a>
    </div>

  </div>

  <div v-if="!isEmptyUsage" class="grid grid-cols-9 auto-rows-auto grid-flow-row gap-9">
    <div class="flex flex-row flex-wrap gap-2 col-span-full row-span-1 h-fit">
      <!--    上次运行-->
      <div v-if="lastAt" class=" h-fit outline rounded  min-w-fit p-2 ">
        距离上次运行任务
        <span class="text-green-500"> {{ new Date(lastAt).toLocaleString() }}</span>
        已过去 <span class="text-green-500"> {{ formatDistanceToNow(lastAt, { locale: zhCN }) }}</span>
      </div>




      <!--    使用入门-->
      <div class="outline h-fit   outline-green-500 rounded p-2">
        操作指南
        <a class="link" href="/options.html#/startup">去查看></a>
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
              <a class="text-2xl font-semibold text-gray-800" :href="display[key].link">
                {{ value }}
                <span>{{ display[key]?.postfix }}</span>
              </a>

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

  <UpdateHint id="update-hint" />

</template>

<style scoped></style>