<template>
  <!--
    Prompt: 创建一个QueryDock组件，实现：
    1. 支持多种查询条件输入（字符串匹配、数值范围）
    2. 使用defineModel进行双向绑定
    3. 通过emit通知更新
    4. 纯Tailwind样式，headless设计
    5. 统一的水平布局，标签在上输入在下
  -->

  <!--
    组件简介：
    QueryDock是一个灵活的查询条件输入组件，支持多种查询条件类型。
    采用headless设计模式，外观完全由props控制。
    使用Vue 3 + TypeScript + Tailwind CSS构建，确保类型安全和样式的高度可定制性。
  -->

  <!-- 主容器 -->
  <div :class="cn('flex flex-wrap gap-4', props.class)">
    <!-- 字符串匹配输入区块 -->
    <div class="flex flex-col">
      <label class="text-sm mb-2">id</label>
      <input type="text" v-model.lazy="queryCondition.hidInclude"
        class="px-3 py-2 rounded border focus:outline-none focus:ring-2" placeholder="请输入关键词" />
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">小区ID</label>
      <input type="text" v-model.lazy="queryCondition.cidInclude"
        class="px-3 py-2 rounded border focus:outline-none focus:ring-2" placeholder="请输入关键词" />
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">小区</label>
      <CommunityQueryBox v-model="communityQueryValue" :initial-cid="queryCondition.cidEqual" />
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">分组</label>
      <TaskGroupQueryBox v-model="groupQueryValue" :initial-group-id="queryCondition.groupId" />
    </div>

    <!-- 数值范围输入区块 -->
    <div class="flex flex-col">
      <label class="text-sm mb-2">总价</label>
      <div class="flex items-center gap-2">
        <input type="number" v-model="queryCondition.totalPriceMin"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2" placeholder="最小值" />
        <span>-</span>
        <input type="number" v-model="queryCondition.totalPriceMax"
          class="px-3 py-2 w-24 rounded border focus:outline-none focus:ring-2" placeholder="最大值" />
      </div>
    </div>

    <div class="flex flex-col">
      <div class="flex items-center gap-2 text-sm mb-2">
        <label class=" ">创建时间</label>
        <Button variant="link" class="p-0 text-sm h-4"
          @click="() => queryCondition.createdAtMin = ISODateStringOfDaysBefore(7)">近一周</Button>
        <Button variant="link" class="p-0 text-sm h-4"
          @click="() => queryCondition.createdAtMin = ISODateStringOfDaysBefore(30)">近一月</Button>
        <Button variant="link" class="p-0 text-sm h-4"
          @click="() => queryCondition.createdAtMin = ISODateStringOfDaysBefore(180)">近半年</Button>
      </div>
      <div class="flex items-center gap-2">
        <input type="date" v-model="queryCondition.createdAtMin"
          class="px-3 py-2  rounded border focus:outline-none focus:ring-2" placeholder="最小值" />

        <span>-</span>
        <input type="date" v-model="queryCondition.createdAtMax"
          class="px-3 py-2  rounded border focus:outline-none focus:ring-2" placeholder="最大值" />
      </div>
    </div>

    <div class="mx-2 ">
      状态
      <div class="grid grid-cols-2 grid-rows-2 gap-2 ">
        <NumSelectButton v-model="queryCondition.status" :value="undefined">全部</NumSelectButton>
        <NumSelectButton v-model="queryCondition.status" :value="HouseTaskStatus.running">正常</NumSelectButton>
        <NumSelectButton v-model="queryCondition.status" :value="HouseTaskStatus.sold" v-if="type === 'sell'">成交
        </NumSelectButton>
        <NumSelectButton v-model="queryCondition.status" :value="HouseTaskStatus.miss">下架</NumSelectButton>
      </div>
    </div>



    <div class="mx-2" v-if="type === 'sell'">
      添加方式
      <div class="grid grid-cols-2 grid-rows-2 gap-2">
        <NumSelectButton v-model="queryCondition.addedType" :value="undefined">全部</NumSelectButton>
        <NumSelectButton v-model="queryCondition.addedType" :value="TaskAddedType.manual">手动添加</NumSelectButton>
        <NumSelectButton class="col-start-1 col-end-3" v-model="queryCondition.addedType"
          :value="TaskAddedType.autoByCommunity">小区任务自动添加</NumSelectButton>
      </div>
    </div>

    <!-- 操作按钮区块 -->
    <div class="flex flex-nowrap items-end justify-end gap-2">
      <button @click="handleApply"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2">
        应用
      </button>
      <button @click="resetCondition"
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2">
        重置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HTMLAttributes, ref, watch } from 'vue'
import { cn } from "@/utils/shadcn-utils"
import { HouseTaskQueryCondition } from "@/types/query-condition";
import { HouseTaskStatus, TaskAddedType } from "@/types/lj";
import SelectButton from "@/components/custom/SelectButton.vue";
import CommunityQueryBox from "@/components/lj/community/CommunityQueryBox.vue";
import TaskGroupQueryBox from "@/components/lj/TaskGroupQueryBox.vue";
import { ISODateStringOfDaysBefore } from '@/utils/date';
import { Button } from '@/components/ui/button';

const NumSelectButton = SelectButton<number>


// Props定义
interface Props {
  class?: HTMLAttributes['class'],
  type?: 'sell' | 'rent'
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined,
  type: 'sell'
})

// 双向绑定模型
const queryCondition = defineModel<HouseTaskQueryCondition>({
  default: () => ({})
})

//子组件model
const communityQueryValue = ref<{ cid: string, name: string }>()
const groupQueryValue = ref<{ groupId: number, name: string }>()
watch(communityQueryValue, (newValue) => {
  queryCondition.value.cidEqual = newValue?.cid
})


// 定义更新事件
const emit = defineEmits<{
  'update': []
}>()

// 处理应用按钮点击
const handleApply = () => {
  emit('update')
}
const resetCondition = () => {
  queryCondition.value = {}
  emit('update')
}

watch(groupQueryValue, (newValue) => {
  queryCondition.value.groupId = newValue?.groupId
})
</script>