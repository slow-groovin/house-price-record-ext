<template>
  <!-- 主容器 -->
  <div :class="cn('flex flex-wrap gap-4', props.class)">
    <!-- 字符串匹配输入区块 -->
    <div class="flex flex-col">
      <label class="text-sm mb-2">id</label>
      <input
        type="text"
        v-model.lazy="queryCondition.cidInclude"
        class="px-3 py-2 rounded border focus:outline-none focus:ring-2"
        placeholder="请输入关键词"
      />
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">名称</label>
      <input
        type="text"
        v-model.lazy="queryCondition.nameInclude"
        class="px-3 py-2 rounded border focus:outline-none focus:ring-2"
        placeholder="请输入关键词"
      />
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">城市代码</label>
      <input
        type="text"
        v-model.lazy="queryCondition.city"
        class="px-3 py-2 max-w-24 rounded border focus:outline-none focus:ring-2"
        placeholder="请输入关键词"
      />
    </div>




    <div class="flex flex-col">
      <label class="text-sm mb-2">平均总价</label>
      <div class="flex items-center gap-2">
        <input
          type="number"
          v-model="queryCondition.avgTotalPriceMin"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2"
          placeholder="最小值"
        />
        <span>-</span>
        <input
          type="number"
          v-model="queryCondition.avgTotalPriceMax"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2"
          placeholder="最大值"
        />
      </div>
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">平均平米单价</label>
      <div class="flex items-center gap-2">
        <input
          type="number"
          v-model="queryCondition.avgUnitPriceMin"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2"
          placeholder="最小值"
        />

        <span>-</span>
        <input
          type="number"
          v-model="queryCondition.avgUnitPriceMax"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2"
          placeholder="最大值"
        />
      </div>
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">在售数量</label>
      <div class="flex items-center gap-2">
        <input
          type="number"
          v-model="queryCondition.onSellCountMin"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2"
          placeholder="最小值"
        />

        <span>-</span>
        <input
          type="number"
          v-model="queryCondition.onSellCountMax"
          class="px-3 py-2 w-24  rounded border focus:outline-none focus:ring-2"
          placeholder="最大值"
        />
      </div>
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">最后一次运行时间</label>
      <div class="flex items-center gap-2">
        <input
          type="date"
          v-model="queryCondition.lastRunningAtMin"
          class="px-3 py-2 rounded border focus:outline-none focus:ring-2"
          placeholder="最小值"
        />
        <span>-</span>
        <input
          type="date"
          v-model="queryCondition.lastRunningAtMax"
          class="px-3 py-2  rounded border focus:outline-none focus:ring-2"
          placeholder="最大值"
        />
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
import {CommunityQueryCondition} from "@/types/query-condition";
import {Label} from '@/components/ui/label'


// Props定义
interface Props {
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined
})


// 双向绑定模型
const queryCondition = defineModel<CommunityQueryCondition>({
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