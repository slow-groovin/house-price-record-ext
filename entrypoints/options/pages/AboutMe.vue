<script setup lang="ts">
import {useExtInfo} from '@/composables/useExtInfo'
const {name,version}=useExtInfo()
</script>

<template>
<pre>
  About {{name}}
  1. 存储基于 浏览器IndexedDB数据库， 不涉及隐私，且不涉及任何数据上传。
  2. 如果遇见BUG, 或者有新需求，欢迎反馈。
  3.

</pre>
</template>

<style scoped>

</style>