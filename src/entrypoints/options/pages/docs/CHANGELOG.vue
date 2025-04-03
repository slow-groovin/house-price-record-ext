<template>
  <h1 class="text-3xl font-bold border-b my-6">更新记录</h1>

  <div class="border p-2 rounded-lg w-fit my-4">
    <h2 class="text-2xl font-bold">当前版本</h2>
    <pre>{{ curVersionChangeLog }}</pre>
  </div>
  <div>
    <h2 class="text-2xl font-bold">历史</h2>

    <pre>{{ historyChangeLog }}</pre>

  </div>
</template>
<script setup lang="ts">
import { curVersionChangeLog, historyChangeLog } from '@/entrypoints/reuse/global-variables'
</script>