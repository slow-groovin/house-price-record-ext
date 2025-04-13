<template>
  <!-- 主容器 -->
  <div :class="cn('flex flex-wrap gap-4', props.class)">
    <!-- 字符串匹配输入区块 -->
    <div class="flex flex-col">
      <label class="text-sm mb-2">房源id</label>
      <input type="text" v-model.lazy="queryCondition.hidInclude"
        class="px-3 py-2 rounded border focus:outline-none focus:ring-2" placeholder="请输入关键词" />
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">小区id</label>
      <input type="text" v-model.lazy="queryCondition.cidInclude"
        class="px-3 py-2 rounded border focus:outline-none focus:ring-2" placeholder="请输入关键词" />
    </div>

    <!-- 数值范围输入区块 -->
    <div class="flex flex-col">
      <label class="text-sm mb-2">旧状态</label>
      <div class="grid grid-rows-2 grid-flow-col gap-2">
        <SelectButton :value="undefined" v-model="queryCondition.oldValue">全部</SelectButton>
        <SelectButton :value="HouseTaskStatus.void" v-model="queryCondition.oldValue">未创建</SelectButton>
        <SelectButton :value="HouseTaskStatus.running" v-model="queryCondition.oldValue">正常</SelectButton>
        <SelectButton :value="HouseTaskStatus.sold" v-model="queryCondition.oldValue" v-if="type === 'sell'">成交
        </SelectButton>
        <SelectButton :value="HouseTaskStatus.miss" v-model="queryCondition.oldValue">下架</SelectButton>
      </div>
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">新状态</label>
      <div class="grid grid-rows-2 grid-flow-col gap-2">
        <SelectButton :value="undefined" v-model="queryCondition.newValue">全部</SelectButton>
        <SelectButton :value="HouseTaskStatus.void" v-model="queryCondition.newValue">未创建</SelectButton>
        <SelectButton :value="HouseTaskStatus.running" v-model="queryCondition.newValue">正常</SelectButton>
        <SelectButton :value="HouseTaskStatus.sold" v-model="queryCondition.newValue" v-if="type === 'sell'">成交
        </SelectButton>
        <SelectButton :value="HouseTaskStatus.miss" v-model="queryCondition.newValue">下架</SelectButton>
      </div>
    </div>

    <div class="flex flex-col">
      <div class="flex items-center gap-2 text-sm mb-2">
        <label class=" ">时间</label>
        <Button variant="link" class="p-0 text-sm h-4"
          @click="() => queryCondition.atMin = ISODateStringOfDaysBefore(7)">近一周</Button>
        <Button variant="link" class="p-0 text-sm h-4"
          @click="() => queryCondition.atMin = ISODateStringOfDaysBefore(30)">近一月</Button>
        <Button variant="link" class="p-0 text-sm h-4"
          @click="() => queryCondition.atMin = ISODateStringOfDaysBefore(180)">近半年</Button>
      </div>
      <div class="flex items-center gap-2">
        <input type="date" v-model="queryCondition.atMin"
          class="px-3 py-2  rounded border focus:outline-none focus:ring-2" placeholder="最小值" />

        <span>-</span>
        <input type="date" v-model="queryCondition.atMax"
          class="px-3 py-2  rounded border focus:outline-none focus:ring-2" placeholder="最大值" />
      </div>
    </div>




    <!-- 操作按钮区块 -->
    <div class="flex flex-col justify-end">
      <button @click="handleApply"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2">
        应用
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from "@/utils/shadcn-utils"
import { HouseStatusChangeQueryCondition } from "@/types/query-condition";
import { Label } from '@/components/ui/label'
import SelectButton from "@/components/custom/SelectButton.vue";
import { HouseTaskStatus } from "@/types/lj";
import { ISODateStringOfDaysBefore } from '@/utils/date';
import { Button } from '@/components/ui/button';


// Props定义
interface Props {
  class?: HTMLAttributes['class'],
  type?: 'sell' | 'rent'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'sell',
  class: undefined
})

// 双向绑定模型
const queryCondition = defineModel<HouseStatusChangeQueryCondition>({
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