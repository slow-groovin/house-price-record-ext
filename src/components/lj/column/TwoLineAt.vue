<script setup lang="ts">
import {formatDistanceToNowHoursOrDays} from "@/utils/date";
import { cn } from "@/utils/shadcn-utils";

const {at, class: klass}=defineProps<{
  at?:number;
  class?:string;
}>()
</script>

<template>

  <template v-if="at">
    <div :class="cn('text-xs',klass)">{{formatDistanceToNowHoursOrDays(at)}}</div>
    <div :class="cn('text-xs',klass)">{{new Date(at).toLocaleString()}}</div>
  </template>
  <template v-else>
    -
  </template>
</template>

<style scoped>

</style>
