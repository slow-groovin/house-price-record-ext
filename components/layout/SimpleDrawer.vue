<template>
  <div :class="cn('flex', position === 'right' ? '' : 'flex-row-reverse', isOpen ? '' : 'translate-x-[calc(100%-1.5rem)]', props.class)">

    <div class="self-center" @click="toggle"
      :class="cn('cursor-pointer hover:bg-neutral-300 shadow  w-6 h-8  border-2  text-gray-800 stroke-2 bg-white', toggleClass)">
      <Icon v-show="!isOpen"  icon="lets-icons:expand-left-light"  class="size-full"/>
      <Icon v-show="isOpen" icon="lets-icons:expand-right-light" class="size-full"/>
    </div>

      <slot name="default"></slot>


  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { HTMLAttributes } from 'vue'
import type { ClassValue } from 'clsx'
import { Icon } from '@iconify/vue'
import { cn } from '@/utils/shadcn-utils'

interface Props {
  class?: HTMLAttributes['class']
  defaultOpen?: boolean
  contentClass?: ClassValue
  toggleClass?: ClassValue
  position?: 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  defaultOpen: false,
  contentClass: '',
  toggleClass: '',
  position: 'left',
})

const isOpen = ref(props.defaultOpen)

const toggle=()=>{
  isOpen.value=!isOpen.value
}
</script>