<script setup lang="ts">

import InfoHover from "@/components/InfoHover.vue";
</script>

<template>

  <InfoHover>
    <div class="w-[388px]">

      <img src="/rooms-sample.png" alt="户型分间" class="block p-4 border rounded mb-8">
      <p class="break-all text-gray-600 italic ">
        <span class="font-bold ">计算面积:</span>
         根据页面内的"户型分间"中的信息计算的面积总和，可能与房本中的套内面积面积存在误差。
      </p>
    </div>
  </InfoHover>
</template>

<style scoped>

</style>