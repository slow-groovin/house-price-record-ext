<template>
  <div v-if="isVisible" :class="cn('relative rounded-lg p-4 shadow-lg', props.class)">
    <button
      @click="close"
      class="absolute top-2 left-2 text-gray-500 hover:text-gray-700 focus:outline-none"
    >
      <Icon class="h-5 w-5" icon="simple-line-icons:close"/>
    </button>
    <div class="mt-4">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import {cn} from "@/utils/shadcn-utils";
import {Icon} from "@iconify/vue";

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

const isVisible = ref(true)

const close = () => {
  isVisible.value = false
}

</script>