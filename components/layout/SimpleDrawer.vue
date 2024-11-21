<template>
  <div :class="cn('flex overflow-auto', props.class)">
    <div v-if="!isOpen" @click="open" :class="cn('cursor-pointer p-2 h-fit  hover:bg-gray-300', toggleClass)">
      👉
    </div>
    <div v-else @click="close" :class="cn('cursor-pointer p-2  hover:bg-gray-300', toggleClass)">
      ❌
    </div>
    <transition
        enter-active-class="transition ease-in-out duration-300 transform"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition ease-in-out duration-300 transform"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
    >
      <div v-if="isOpen" >
        <slot name="default"></slot>
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import type { ClassValue } from 'clsx'

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