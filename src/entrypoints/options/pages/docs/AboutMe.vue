<script setup lang="ts">
import { useExtInfo } from '@/composables/useExtInfo'
import AboutSellDetail from './AboutSellDetail.vue';
import AboutRentDetail from './AboutRentDetail.vue';
import { useLocalStorage } from '@vueuse/core';
import { useMode } from '../../composables/useMode';


const { name, version } = useExtInfo()

const { mode } = useMode()
</script>

<template>

  <div
    class="flex items-center justify-center my-8 font-bold text-2xl text-center bg-gradient-to-r from-primary via-lime-500 to-blue-500 text-transparent bg-clip-text w-fit">
    <span class="font-light text-xl text-black">关于 &nbsp;</span> {{ name }}{{ version }}
    <img src="/icon/24.png" alt="icon" class="inline">
  </div>

  <pre class="mt-9">0. 开源, 完全免费, 无广告无登录, 目的是让任何人能够真实地感知二手房市场
1. 这个扩展程序不收集你的数据, 不会发送任何网络请求, 你可以通过控制台 fetch 和 XMLHttpRequest 找到所有的网络请求调用(可能有浏览器的自动遥测request, 非本插件所为)。
2. 存储基于 浏览器IndexedDB数据库， 不涉及隐私，且不涉及任何数据上传
3. 如果遇见BUG, 或者有新需求建议，欢迎反馈。
4. 应用商店审核周期约为一周, 官方网站上会及时放置最新的版本
</pre>


  <AboutSellDetail v-if="mode === 'sell'" />
  <AboutRentDetail v-else />
  <div class="mt-16 w-fit p-4 border border-lime-100 shadow rounded-lg text-2xl text-center font-semibold">
    如果喜欢这款插件, 请给一个浏览器插件市场真实的评价 或者 Github Star⭐
  </div>

</template>

<style scoped></style>