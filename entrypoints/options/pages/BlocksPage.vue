<template>



  <div :class="cn('grid grid-cols-2  grid-flow-row auto-cols-auto gap-x-6 gap-y-4 items-start w-full max-w-2xl mx-auto p-6', props.class)">
    <div>
      introduction
      目的是...., 通过....
      如果遇到.... 请.....
    </div>
    <!-- 操作按钮 -->
    <div class="flex justify-start space-x-4 pt-4">
      <button
        @click="saveSettings"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        保存
      </button>
      <button
        @click="resetSettings"
        class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        重置设置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'

import { cn } from '@/utils/shadcn-utils'
import type { HTMLAttributes } from 'vue'
import {Switch} from "@/components/ui/switch";
import {storage} from "wxt/storage";

/**
 * Prompt: 实现一个设置页面
 *
 * 组件说明：
 */

// Props 定义
const props = defineProps<{
  class?: HTMLAttributes['class']
}>()

// Emits 定义
const emit = defineEmits<{
  (e: 'update', settings: typeof defaultSettings): void
}>()

// 默认设置
const defaultSettings = {
  autoRunHouseTask: true,
  confirmDeleteChangeItem: true,
  recordHistory: false,
  thirdPartyIntegration: true
}

// 设置状态
const settings = ref({ ...defaultSettings })


function loadSettings() {
}

// 保存设置
const saveSettings = async () => {
}

// 重置设置
const resetSettings = () => {
  settings.value = { ...defaultSettings }
  emit('update', settings.value)
}
onMounted(()=>{
  loadSettings()
})
</script>