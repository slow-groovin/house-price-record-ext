<template>
  <div :class="cn('flex gap-4', props.class)">
    <div class="flex flex-col items-center">
      <div class="w-4 h-4 rounded-full " :class="props.color"></div>
      <div :style="{ height: `${spacing}px` }" class="w-px  border-l border-dashed " :class="props.color"></div>
    </div>

    <slot/>
  </div>

</template>

<script setup lang="ts">
import type {HTMLAttributes} from 'vue'
import {cn} from "@/utils/shadcn-utils";


interface Props {
  class?: HTMLAttributes['class']
  spacing?: number
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  spacing: 64,
  color: 'bg-blue-400'
})


</script>