<script setup lang="ts">
import {useExtInfo} from '@/composables/useExtInfo'

const {name, version} = useExtInfo()
</script>

<template>
<pre>
  About {{ name }}
  0. 完全免费, 无广告, 无登录, 完全无偿开发, 目的是让任何人能够真实地感知二手房市场
  1. 完全离线, 存储基于 浏览器IndexedDB数据库， 不涉及隐私，且不涉及任何数据上传(可能有浏览器的自动遥测request, 非本插件所为)。
  2. 如果遇见BUG, 或者有新需求建议，欢迎反馈。
  3. 为了权限最小化, 没有自动新版本通知的功能, 如果遇到问题, 请手动检查更新.
  4. 应用商店审核周期约为一周, 官方网站上会及时放置最新的版本
  5. 未来计划新增功能: 租房,黄平台

</pre>
  <a href="https://real-price.api2o.com/" class="link" target="_blank">官方网站</a>

</template>

<style scoped>

</style>