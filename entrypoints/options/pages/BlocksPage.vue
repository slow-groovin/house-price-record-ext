<template>
  <div :class="cn('flex flex-col gap-x-6 gap-y-4 items-start w-full  p-6', props.class)">
    <h1 class="text-3xl font-bold my-2">拦截规则 </h1>
    <blockquote>
      设置拦截在lianjia.com页面内,后台的一些请求: 行为分析/第三方分析等
    </blockquote>
    <blockquote>
      如果您不是专业用户, 建议不要修改此设置, 并在出现访问问题时, 尝试禁用所有规则并保存
    </blockquote>



    <table>
      <tbody>
      <template v-for="(rule,index) in ljMetricRules">
        <tr v-if="!rule.must_on">
          <th>{{ index + 1 }}.</th>
          <th>
            <div class="flex flex-col text-right">
              <span class="text-base font-medium">{{ rule.action_desc }}</span>
              <span class="text-sm text-gray-300">{{ rule.effect_desc }}</span>
            </div>
          </th>
          <th>
            <div class="flex flex-col text-left">
              <Switch v-model:checked="settings2[rule.id]" class="text-right"/>
            </div>
          </th>
          <th>
            默认值: {{ rule.default_on ? '✅' : '❌' }}
          </th>
        </tr>
      </template>

      </tbody>
    </table>

    <!-- 操作按钮 -->
    <div class="flex justify-start space-x-4 pt-4">
      <button
        @click="saveSettings"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        保存
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {HTMLAttributes} from 'vue'
import {onMounted, ref} from 'vue'

import {cn} from '@/utils/shadcn-utils'
import {ljMetricRules, updateLjRulesById} from "@/entrypoints/reuse/block";
import {Switch} from "@/components/ui/switch";
import {browser} from "wxt/browser";

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
const settings = ref({...defaultSettings})
const settings2 = ref<Record<number, boolean>>({})

async function loadSettings() {
  const _rules = await browser.declarativeNetRequest.getDynamicRules()
  for (let rule of _rules) {
    if (ljMetricRules.some(r => r.id === rule.id)) {
      settings2.value[rule.id] = true
    }
  }
}

// 保存设置
const saveSettings = async () => {
  const removedIds = Object.entries(settings2.value).filter(([k, v]) => !v).map(([k, v]) => Number(k))
  const addedIds = Object.entries(settings2.value).filter(([k, v]) => v).map(([k, v]) => Number(k))
  await updateLjRulesById(removedIds, addedIds)
  alert('设置成功!')
}

// 重置设置
const resetSettings = () => {
  settings.value = {...defaultSettings}
  emit('update', settings.value)
}
onMounted(() => {
  loadSettings()
})
</script>

<style scoped lang="postcss">
th {
  @apply py-6 px-4;
}

</style>