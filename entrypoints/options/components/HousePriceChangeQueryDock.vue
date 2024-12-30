<template>
  <!-- 主容器 -->
  <div :class="cn('flex flex-wrap gap-4', props.class)">
    <!-- 字符串匹配输入区块 -->
    <div class="flex flex-col">
      <label class="text-sm mb-2">房源id</label>
      <input
        type="text"
        v-model.lazy="queryCondition.hidInclude"
        class="px-3 py-2 rounded border focus:outline-none focus:ring-2"
        placeholder="请输入关键词"
      />
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">小区id</label>
      <input
        type="text"
        v-model.lazy="queryCondition.cidInclude"
        class="px-3 py-2 rounded border focus:outline-none focus:ring-2"
        placeholder="请输入关键词"
      />
    </div>

    <!-- 数值范围输入区块 -->
    <div class="flex flex-col">
      <label class="text-sm mb-2">老价格</label>
      <div class="flex items-center gap-2">
        <input
          type="number"
          v-model="queryCondition.oldValueMin"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2"
          placeholder="最小值"
        />
        <span>-</span>
        <input
          type="number"
          v-model="queryCondition.oldValueMax"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2"
          placeholder="最大值"
        />
      </div>
    </div>
    <div class="flex flex-col">
      <label class="text-sm mb-2">新价格</label>
      <div class="flex items-center gap-2">
        <input
          type="number"
          v-model="queryCondition.newValueMin"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2"
          placeholder="最小值"
        />
        <span>-</span>
        <input
          type="number"
          v-model="queryCondition.newValueMax"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2"
          placeholder="最大值"
        />
      </div>
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">创建时间</label>
      <div class="flex items-center gap-2">
        <input
          type="date"
          v-model="queryCondition.atMin"
          class="px-3 py-2  rounded border focus:outline-none focus:ring-2"
          placeholder="最小值"
        />

        <span>-</span>
        <input
          type="date"
          v-model="queryCondition.atMax"
          class="px-3 py-2  rounded border focus:outline-none focus:ring-2"
          placeholder="最大值"
        />
      </div>
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">类型</label>
      <div class="flex items-center gap-2">
        <SelectButton :value="undefined" v-model="queryCondition.type">全部</SelectButton>
        <SelectButton :value="'decrease'" v-model="queryCondition.type">降价</SelectButton>
        <SelectButton :value="'increase'" v-model="queryCondition.type">涨价</SelectButton>
      </div>
    </div>


    <!-- 操作按钮区块 -->
    <div class="flex flex-col justify-end">
      <button
        @click="handleApply"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2"
      >
        应用
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {HTMLAttributes} from 'vue'
import {cn} from "@/utils/shadcn-utils"
import {HouseChangeQueryCondition} from "@/types/query-condition";
import {Label} from '@/components/ui/label'
import SelectButton from "@/components/custom/SelectButton.vue";




// Props定义
interface Props {
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined
})

// 双向绑定模型
const queryCondition = defineModel<HouseChangeQueryCondition>({
  default: () => ({})
})

// 定义更新事件
const emit = defineEmits<{
  'update': []
}>()

// 处理应用按钮点击
const handleApply = () => {
  emit('update')
}
</script>