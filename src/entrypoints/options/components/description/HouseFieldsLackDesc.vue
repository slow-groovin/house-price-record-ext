<script setup lang="ts">
import InfoHover from '@/components/information/InfoHover.vue';

</script>

<template>
  <InfoHover>
    <pre class="text-sm">
运行小区任务只能获取小区列表页中的房源信息, 会缺少:
1. 计算面积/计算面积单价
2. 上架时间/成交时间
3. 楼型
4. 成交状态

以上信息只能通过运行房源任务获取</pre>
  </InfoHover>
</template>