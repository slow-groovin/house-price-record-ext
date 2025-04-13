<template>
  <div :class="cn('fixed top-[50%] right-0.5 bg-background/30 text-primary/35 shadow-lg rounded-3xl p-4 space-y-2 shadow-foreground/30',
    'hover:bg-background  active:border-foreground/30 active:shadow-2xl  hover:text-primary/80',props.class)">
    <div
      v-for="item in items"
      :key="item.id"
      class="cursor-pointer hover:underline"
      @click="scrollTo(item.id)"
    >
      {{ item.text }}
    </div>

  </div>
</template>

<script lang="ts" setup>

import {HTMLAttributes} from "vue";
import {cn} from '@/utils/shadcn-utils'
function scrollTo(id:string) {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
}


const props=defineProps<{
  items:{id:string,text:string}[],
  class?: HTMLAttributes['class']
}>()

</script>

<style scoped>
/* 可以根据需要添加自定义样式 */
</style>
