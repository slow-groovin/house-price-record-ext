<script setup lang="ts">
import { ref, browser, onMounted } from '#imports';
import { useExtInfo } from '@/composables/useExtInfo';
import { ljMetricRules } from '@/entrypoints/reuse/block';
import { getIndexedDBUsage } from '@/utils/browser';
import { useLocalStorage } from '@vueuse/core';
import HomePage from './sell/HomePage.vue';
import RentHomePage from './rent/RentHomePage.vue';
import InfoHover from '@/components/information/InfoHover.vue';
import { HardDrive } from 'lucide-vue-next';

const selectOption = useLocalStorage<'sell' | 'rent'>('select-mode', 'sell')
const { name, version } = useExtInfo()
const enableRulesCount = ref(0)
const allRulesCount = ref(0)
const isEmptyUsage = ref(false)
const usedMb = ref(0)
async function loadRules() {
  const _rules = await browser.declarativeNetRequest.getDynamicRules()
  enableRulesCount.value = _rules.length
  allRulesCount.value = ljMetricRules.length
}
onMounted(() => {
  loadRules()
  getIndexedDBUsage().then(rs => {
    usedMb.value = Number(rs.usage.toPrecision(2))
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


  </div>


  <HomePage v-if="selectOption === 'sell'"></HomePage>

  <RentHomePage v-if="selectOption === 'rent'" />


  <div class="outline col-span-3  w-fit h-fit outline-green-500 rounded p-2 my-2">
    当前已经激活 <span class="font-extrabold text-green-500">{{ enableRulesCount }}</span>/{{ allRulesCount }} 条请求过滤规则
    <a class="link" href="/options.html#/blocks">去查看></a>
    <InfoHover>如果您在访问本插件目标站点时遇到了无法排查的网络访问问题, 请尝试关闭规则进行排查</InfoHover>
  </div>

  <div class="border w-fit rounded-lg shadow p-6 flex items-center">
    <HardDrive class="mr-4" />

    <div>
      <p class="text-sm text-gray-600">数据总量</p>
      <p class="text-2xl font-semibold text-gray-800">{{ usedMb }}<span>MB</span></p>
    </div>
  </div>
</template>

<style scoped></style>