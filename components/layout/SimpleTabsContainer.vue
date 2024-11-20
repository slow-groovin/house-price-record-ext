<template>
  <div :class="cn('flex flex-col', props.class)">
    <div class="flex border-b flex-wrap">
      <div
          v-for="(tab, index) in tabs"
          :key="index"
          @click="activeTab = index"
          :class="cn(
          'px-4 py-2 text-sm font-medium focus:outline-none',
          activeTab === index
            ? 'border-b-2 border-orange-500 text-gray-900'
            : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
        )"
      >
        {{ tab.label }}
      </div>
    </div>
    <div class="mt-4">
      <template v-for="(tab, index) in tabs" :key="index">
        <div v-if="activeTab === index">
          <slot :name="tab.name">
            <!-- 默认内容 -->
            <p class="text-gray-700">This is the default content for {{ tab.label }}</p>
          </slot>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { HTMLAttributes } from 'vue'
import {Maybe} from "@/types/generic";

interface Tab {
  name: string
  label: string
}

interface Props {
  tabs: Tab[]
  initialTab?:number
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  initialTab: 0,
})

const emit = defineEmits<{
  (e: 'tabChange', index: number): void
}>()

const activeTab = ref(props.initialTab)

watch(activeTab, (newValue) => {
  emit('tabChange', newValue)
})

// 注意：这里假设 cn 函数已经在其他地方定义并导入
// 如果没有，您需要实现或导入这个函数
declare function cn(...inputs: any[]): string
</script>