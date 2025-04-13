<script setup lang="ts">

const { value, change, unit = '万' } = defineProps<{
  value?: number,
  change?: number,
  unit?: string
}>()

const color = () => change ? (change < 0 ? 'text-green-700' : 'text-red-500') : ''
</script>

<template>
  <div v-if="value" class="flex flex-nowrap items-center">
    <div class="text-lg font-bold ">{{ value }}{{ unit }}</div>
    <div v-if="change" class="text-sm font-bold" :class="color()">({{ change > 0 ? '+' : '' }}{{ change }})</div>
  </div>


</template>

<style scoped></style>