<template >
  <!--
  Prompt: 创建一个QuerySortDock组件，实现单字段排序功能，使用Vue 3组合式API、TypeScript、
  Tailwind CSS和flex布局。组件应该是headless的，通过prop接收样式类。使用defineModel
  绑定排序状态，通过emit通知父组件更新。排序交互为三项切换（无序->升序->降序），
  使用Iconify-vue的箭头图标表示排序方向。

  QuerySortDock组件：一个可自定义的查询排序组件，允许用户对指定字段进行排序操作。
  组件支持单字段排序，并通过图标直观地显示排序状态。
  -->
  <div :class="cn('flex flex-wrap gap-2', props.class)">
    <!-- 遍历字段并创建排序按钮 -->
    <button
      v-for="field in fields"
      :key="field"
      @click="toggleSort(field)"
      class="flex items-center gap-1 px-2 py-1 rounded border  bg-neutral-200 hover:bg-amber-50"
      :class="{'ring-2 ring-amber-500 bg-amber-50':modelValue?.field === field}"
    >
      <span>{{ fieldTextMap[field]??field }}</span>
      <!-- 显示排序图标 -->
      <Icon  :icon="modelValue?.field === field?getSortIcon(modelValue?.order):'bx:sort'" />
    </button>
  </div>
</template>

<script setup lang="ts" generic="T">
import {computed, HTMLAttributes} from 'vue'
import { Icon } from '@iconify/vue'
import { cn } from "@/utils/shadcn-utils"
import {SortState} from "@/types/query-condition";

// 定义组件的props
interface Props<T> {
  fields: (keyof T)[],
  fieldTextMap?:Record<string,string>,
  class?: HTMLAttributes['class']
}


const props = defineProps<Props<T>>()

// 使用defineModel创建双向绑定
const modelValue = defineModel<SortState<T>>()

// 定义emit函数类型
const emit = defineEmits<{
  (e: 'update'): void
}>()

// 切换排序状态
const toggleSort = (field: keyof T) => {
  if(!modelValue.value){
    return
  }
  let newOrder: 'asc' | 'desc' | undefined = 'desc'
  let newField: keyof T|undefined=field
  if (modelValue.value?.field === field) {
    if (modelValue.value?.order === 'desc') newOrder = 'asc'
    else if (modelValue.value?.order === 'asc') {
      newField=undefined
      newOrder = undefined
    }
  }

  modelValue.value.field = newField
  modelValue.value.order = newOrder

  emit('update')
}

// 获取排序图标
const getSortIcon = computed(() => (order?: 'asc' | 'desc' | null) => {
  if (order === 'asc') return 'mdi:arrow-up'
  if (order === 'desc') return 'mdi:arrow-down'
  return ''
})
</script>