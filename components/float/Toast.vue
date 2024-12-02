<template>
  <div
    v-show="isVisible"
    :class="cn(
      positionType === 'fixed' ? 'fixed '+positionClasses[position] : '',
      'w-fit max-w-full pr-8 rounded' ,
      'relative',
      'transition-opacity duration-300',
      typeClasses[type],
      $props.class
    )"
    role="alert"
  >
    <Icon class="h-5 w-5 absolute  right-0" icon="simple-line-icons:close" @click="()=>isVisible=false"/>
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { PropType } from 'vue'
import {cn} from "@/utils/shadcn-utils";
import {Icon} from "@iconify/vue";

type ToastType = 'info' | 'success' | 'warning' | 'error'
type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
type PositionType = 'fixed' | 'block'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String as PropType<ToastType>,
    default: 'info'
  },
  position: {
    type: String as PropType<ToastPosition>,
    default: 'bottom-center'
  },
  positionType: {
    type: String as PropType<PositionType>,
    default: 'fixed'
  },
  duration: {
    type: Number,
    required: false,
  },
  class: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['destroy'])

const isVisible = ref(false)

const typeClasses = {
  info: 'bg-blue-500 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-white',
  error: 'bg-red-500 text-white'
}

const positionClasses: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4',
  'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
  'top-right': 'top-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2',
  'bottom-right': 'bottom-4 right-4'
}

let timer: number | null = null

const show = () => {
  isVisible.value = true
  if(props.duration){
    timer = window.setTimeout(() => {
      isVisible.value = false
      emit('destroy')
    }, props.duration)
  }

}

onMounted(() => {
  show()
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>

