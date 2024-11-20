<template>
  <CalendarGraph :data="contributionData" class="my-4" />
</template>

<script setup lang="ts">


import CalendarGraph from "@/components/lj/CalendarGraph.vue";

const contributionData = {
  startDate: new Date('2024-11-01'),
  array: [true, false, true, true, false, /* ... 更多数据 */],
};
</script>