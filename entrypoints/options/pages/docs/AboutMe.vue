<script setup lang="ts">
import { useExtInfo } from '@/composables/useExtInfo'
import { Icon } from "@iconify/vue";


const { name, version } = useExtInfo()
</script>

<template>

  <div
    class="flex items-center justify-center my-8 font-bold text-2xl text-center bg-gradient-to-r from-primary via-lime-500 to-blue-500 text-transparent bg-clip-text w-fit">
    <span class="font-light text-xl text-black">关于 &nbsp;</span> {{ name }}{{ version }}
    <img src="/icon/24.png" alt="icon" class="inline">
  </div>


  <div class="flex items-center gap-16 mb-4">

    <a href="https://real-price.api2o.com/" class="link text-2xl " target="_blank">官方网站</a>

    <a href="https://github.com/slow-groovin/house-price-record-ext" target="_blank"
      class="link text-black text-2xl flex items-center">
      <Icon icon="akar-icons:github-fill" class="text-black inline" /> GitHub
    </a>
  </div>

  <pre class="mt-9">0. 开源, 完全免费, 无广告, 无登录, 完全无偿开发, 目的是让任何人能够真实地感知二手房市场
1. 这个扩展程序不收集你的数据, 不会发送任何网络请求, 你可以通过控制台 fetch 和 XMLHttpRequest 找到所有的网络请求调用(可能有浏览器的自动遥测request, 非本插件所为)。
2. 存储基于 浏览器IndexedDB数据库， 不涉及隐私，且不涉及任何数据上传
3. 如果遇见BUG, 或者有新需求建议，欢迎反馈。
4. 为了权限最小化, 没有自动新版本通知的功能, 如果遇到问题, 请手动检查更新.
5. 应用商店审核周期约为一周, 官方网站上会及时放置最新的版本
6. 未来计划新增功能: 租房,黄平台
</pre>

  <div class="mt-16 w-fit p-4 border border-lime-100 shadow rounded-lg text-2xl text-center font-semibold">
    如果喜欢这款插件, 请给一个浏览器插件市场真实的评价 或者 Github Star⭐
  </div>


</template>

<style scoped></style>