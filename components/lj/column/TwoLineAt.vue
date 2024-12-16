<script setup lang="ts">
import {formatDistanceToNowHoursOrDays} from "@/utils/date";

const {at}=defineProps<{
  at?:number;
}>()
</script>

<template>
  <div v-if="at" class="text-xs">
    <div class="">{{formatDistanceToNowHoursOrDays(at)}}</div>
    <div>{{new Date(at).toLocaleString()}}</div>
  </div>
  <div v-else>
    -
  </div>
</template>

<style scoped>

</style>