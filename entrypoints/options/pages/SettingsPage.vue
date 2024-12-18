<template>
  <!-- 主设置容器 -->
  <div v-if="isDebug">
    {{ settings }}
  </div>


  <div
    :class="cn('grid grid-cols-2  grid-flow-row auto-cols-auto gap-x-6 gap-y-4 items-start w-full max-w-2xl mx-auto p-6', props.class)">


    <!-- 存储空间 -->
    <h1 class="text-2xl  w-fit font-bold col-span-2 border-b border-black">
      存储空间使用
    </h1>
    <div class="flex flex-col text-right">
      <span class="text-base font-medium">已使用存储空间: {{ diskUsage?.usage?.toFixed(2) }}MB </span>
      <span class="text-sm text-gray-300">总可用空间(取决于电脑剩余空间): {{ diskUsage?.quota?.toFixed(0) }}GB </span>
    </div>


    <h1 class="text-2xl  w-fit font-bold col-span-2 border-b border-black">
      房源任务设置
    </h1>


    <!-- 自动更新设置 -->
    <div class="flex flex-col text-right">
      <span class="text-base font-medium">自动更新任务</span>
    </div>
    <div class="flex flex-col">
      <Switch v-model:checked="settings.autoRunHouseTask" class="text-right"/>
      <span class="text-sm text-gray-300">每次打开房源页面时自动运行任务更新信息</span>
    </div>


    <h1 class="text-2xl  w-fit font-bold col-span-2 border-b border-black">
      价格/状态变更列表设置
    </h1>
    <div class="flex flex-col text-right">
      <span class="text-base font-medium">删除确认</span>
    </div>
    <div class="flex flex-col">
      <Switch v-model:checked="settings.confirmDeleteChangeItem" class="text-right" disabled/>
      <span class="text-sm text-gray-300">删除变更记录前尽心确认</span>
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
import type {HTMLAttributes} from 'vue'
import {onMounted, ref} from 'vue'

import {cn} from '@/utils/shadcn-utils'
import {Switch} from "@/components/ui/switch";
import {storage} from "wxt/storage";
import {getIndexedDBUsage} from "@/utils/browser";
import {useExtTitle} from "@/composables/useExtInfo";
import {useDevSetting} from "@/entrypoints/reuse/global-variables";

const {isDebug}=useDevSetting()

/**
 * Prompt: 实现一个设置页面
 *
 * 组件说明：
 */
useExtTitle('⚙️设置')

// Props 定义
const props = defineProps<{
  class?: HTMLAttributes['class']
}>()


// 默认设置
const defaultSettings: Record<string, boolean> = {
  autoRunHouseTask: true,
  confirmDeleteChangeItem: true,
  recordHistory: false,
  thirdPartyIntegration: true
}

// 设置状态
const settings = ref<Record<string, boolean>>({...defaultSettings})
const diskUsage = ref({usage: 0, quota: 0, percentage: 0})

function loadSettings() {
  // 从本地存储加载设置
  // ...
  storage.getItems([
    'local:autoRunHouseTask',
    'local:confirmDeleteChangeItem',
  ]).then(res => {
    console.log(res)
    res.forEach(item => {
      let key = item.key.replace('local:', '');
      if (item.value !== null && item.value !== undefined) {
        settings.value[key] = item.value as boolean
      } else {
        settings.value[key] = defaultSettings[key]
      }
    })
  })
}

// 保存设置
const saveSettings = async () => {

  await storage.setItems([
    {key: 'local:autoRunHouseTask', value: settings.value.autoRunHouseTask},
    {key: 'local:confirmDeleteChangeItem', value: settings.value.confirmDeleteChangeItem},
  ]);
}

// 重置设置
const resetSettings = () => {
  settings.value = {...defaultSettings}
}


onMounted(async () => {
  loadSettings()
  // 示例：调用该函数并打印结果
  diskUsage.value = await getIndexedDBUsage()
})
</script>