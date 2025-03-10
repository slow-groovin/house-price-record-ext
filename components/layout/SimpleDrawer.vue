<template>
  <div :class="cn('flex',
    position === 'right' ? '' : 'flex-row-reverse',
    isOpen ? '' :
      position === 'right' ? 'translate-x-[calc(100%-1.5rem)]' : '-translate-x-[calc(100%-1.5rem)]',
    props.class)">

    <div class="self-center" @click="toggle"
      :class="cn('cursor-pointer hover:bg-neutral-300 shadow  w-6 h-8  border-2  text-gray-800 stroke-2 bg-white', toggleClass)">
      <Icon  :icon="arrowIcon" class="size-full" />
    </div>

    <slot name="default"></slot>


  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
const arrowIcon=computed(()=>{
  const bit1=isOpen.value?1:0
  const bit2=props.position==='left'?1:0
  return (bit1 ^ bit2)?"lets-icons:expand-right-light":"lets-icons:expand-left-light"
})

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>