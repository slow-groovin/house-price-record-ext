<template>
  <div :class="cn('flex overflow-auto ', props.class)">

    <div :class="{'w-0 overflow-hidden':!isOpen}" >
      <slot name="default"></slot>
    </div>

    <div class="self-center">
      <Icon v-if="!isOpen" @click="open" icon="lets-icons:expand-right-light"
            :class="cn('cursor-pointer  hover:bg-gray-300 w-4 h-8 border text-gray-800 stroke-2', toggleClass)"/>
      <Icon v-else @click="close" icon="lets-icons:expand-left-light" :class="cn('cursor-pointer hover:bg-gray-300  w-4 h-8 border text-gray-800 stroke-2', toggleClass)">
      </Icon>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import type { ClassValue } from 'clsx'
import {Icon } from '@iconify/vue'

interface Props {
  class?: HTMLAttributes['class']
  defaultOpen?: boolean
  contentClass?: ClassValue
  toggleClass?: ClassValue
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  defaultOpen:false,
  contentClass: '',
  toggleClass: ''
})

const isOpen = ref(props.defaultOpen)

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}
</script>