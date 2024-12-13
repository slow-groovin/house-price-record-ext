<script setup lang="ts" generic="T">
import { computed } from 'vue'
import { cn } from "@/utils/shadcn-utils"
import type { HTMLAttributes } from 'vue'

/**
 * Prompt: 创建一个类似于 radio button 的可取消选择组件，使用 Vue 3.5+、组合式 API、Tailwind CSS、TypeScript 和 Flex 布局。
 * 组件应该是 headless 的，通过 prop 接收样式类，并使用 cn 函数混合样式。
 *
 * CustomRadioButton 组件
 * 这个组件类似于 radio button，但允许用户通过再次点击来取消选择。
 * 它使用 defineModel 来双向绑定值，并通过不同的背景色来区分选中和未选中状态。
 */

interface Props {
  value: T|undefined,
  canCancel?:boolean,
  class?: HTMLAttributes['class']
}


const props = withDefaults(defineProps<Props>(), {
  class: '',
  canCancel:false,
})

const model = defineModel<T | null>()

// 计算当前按钮是否被选中
const isSelected = computed(() => model.value === props.value)

// 处理按钮点击事件
const handleClick = () => {
  if (isSelected.value) {
    if(props.canCancel)
      model.value = null // 取消选择
  } else {
    model.value = props.value // 选中
  }
}
</script>

<template>
  <!-- 主容器 -->
  <button
    type="button"
    :class="cn(
      'px-1 py-1 text-sm rounded-md transition-colors duration-200 ease-in-out hover:outline-none',
      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
      props.class
    )"
    @click="handleClick"
  >
    <!-- 默认插槽用于自定义内容 -->
    <slot></slot>
  </button>
</template>