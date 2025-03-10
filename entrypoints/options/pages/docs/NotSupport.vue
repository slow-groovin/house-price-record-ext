<template>
  <h1 class="text-2xl font-bold text-primary" v-if="isChrome && supportSidePanel">此浏览器支持本插件功能</h1>

  <div v-else class="flex flex-col container items-center gap-4">

    <h1 class="text-2xl font-bold text-red-500">此浏览器不支持本插件功能</h1>
    <div class="grid grid-cols-2 w-fit gap-2 border p-2 rounded-lg">
      <div>是否是Chrome内核</div>
      <div class="bg-gray-300 p-1 rounded w-fit text-primary">{{ isChrome }}</div>
      <div>是否支持SidePanel</div>
      <div class="bg-gray-300 p-1 rounded w-fit text-primary">{{ supportSidePanel }}</div>
      <div>Chrome内核版本</div>
      <div class="bg-gray-300 p-1 rounded w-fit text-primary">{{ chromeVersion }}</div>
    </div>
    <p class="text-red-600">
      此扩展使用了 sidePanel API，但是您的当前浏览器不支持SidePanel, 因此扩展无法正常工作
    </p>

    <p>
      请使用 Chrome 内核大于 114 且未禁用 sidePanel API 的浏览器（如 Edge 或 Chrome）(某些浏览器, 如360极速浏览器X, 屏蔽了SidePanel功能)。
    </p>

  </div>
</template>

<script setup lang="ts">
import { useTitle } from '@vueuse/core';
import { ref, onMounted } from 'vue';

const isChrome = ref(typeof chrome !== 'undefined');
const supportSidePanel = ref(!!chrome.sidePanel);
const extractChromeVersion = (userAgent: string) => {
  const match = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
  return match ? match[1] : 'Unknown';
};
const chromeVersion = ref(extractChromeVersion(window.navigator.userAgent))

useTitle('浏览器不支持此扩展')
onMounted(() => {

});
</script>

<style scoped>

</style>
