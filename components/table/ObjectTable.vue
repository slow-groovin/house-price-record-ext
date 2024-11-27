<template>
  <div v-if="data" :class="cn('border border-gray-200 rounded-lg overflow-hidden', props.class)">
    <div v-for="(value, key) in props.data" :key="key" class="flex">
      <div class="flex-1 p-2 border-b border-r border-gray-200">{{ key }}</div>
      <div class="flex-1 p-2 border-b border-gray-200">{{ JSON.stringify(value) }}</div>
    </div>
  </div>
  <div v-else>
    {{ data }}
  </div>
</template>

<script setup lang="ts">
import type {HTMLAttributes} from 'vue'
import {cn} from '@/utils/shadcn-utils'

interface Props {
  data?: any
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined
})


</script>