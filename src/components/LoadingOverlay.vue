<template>
  <!--
    Prompt: 一个表示运行中的遮蔽框，具有绝对定位，占满整个容器，
    使用毛玻璃背景效果，并有一个 CSS 动画旋转的图标。
    通过 v-if 控制显示，并具有延迟显示功能，在短时间加载中不显示效果，但仍然阻止用户交互。
  -->
  <!--
    组件简介：LoadingOverlay 是一个可复用的加载遮罩层组件，
    用于在异步操作或页面加载时显示。它提供了毛玻璃背景效果和旋转的加载图标，
    增强了用户体验。组件是 headless 的，允许通过 prop 自定义样式。
    支持延迟显示，避免短时间加载造成的闪烁，同时在延迟期间仍然阻止用户交互。
    使用 v-if 控制显示，确保在不需要时完全从 DOM 中移除。
  -->

  <!-- 主容器 -->
  <div
    :class="cn('absolute inset-0 flex items-center justify-center', props.class)"
  >
    <div      v-if="isVisible"  class=""  >
      <!-- 毛玻璃背景 -->
      <div class="absolute inset-0 backdrop-blur-sm "></div>

      <!-- 加载图标容器 -->
      <div class="relative" v-if="!disableAnim">
        <!-- 旋转的加载图标 -->
        <svg
          class="animate-spin h-10 w-10 text-green-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
import {HTMLAttributes, onMounted, onUnmounted, ref} from 'vue'
import {cn} from "@/utils/shadcn-utils"

// 定义组件的 props
interface Props {
  class?: HTMLAttributes['class']
  delay?: number,
  disableAnim?:boolean
}

const props = withDefaults(defineProps<Props>(), {
  delay: 200 // 默认延迟时间为 200ms
})

// 控制组件可见性的响应式变量
const isVisible = ref(false)

// 用于处理延迟显示的定时器
let timer: number | null = null

// 显示加载遮罩的函数
const showOverlay = () => {
  if (timer === null) {
    timer = window.setTimeout(() => {
      isVisible.value = true
    }, props.delay)
  }
}



onMounted(()=>{
  showOverlay()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (timer !== null) {
    clearTimeout(timer)
  }
})
</script>