<script setup lang="ts">
import {formatDistanceToNowHoursOrDays} from "@/utils/date";

const {at}=defineProps<{
  at?:number;
}>()
</script>

<template>
  <template v-if="at">
    <div class="text-xs">{{formatDistanceToNowHoursOrDays(at)}}</div>
    <div class="text-xs">{{new Date(at).toLocaleString()}}</div>
  </template>
  <template v-else>
    -
  </template>
</template>

<style scoped>

</style>