<template>
  <!-- 主容器 -->
  <div :class="cn('flex flex-wrap gap-4', props.class)">
    <!-- 字符串匹配输入区块 -->
    <div class="flex flex-col">
      <label class="text-sm mb-2">id</label>
      <input type="text" v-model.lazy="queryCondition.cidLike"
        class="px-3 py-2 rounded border focus:outline-none focus:ring-2" placeholder="请输入关键词" />
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">名称</label>
      <input type="text" v-model.lazy="queryCondition.nameLike"
        class="px-3 py-2 rounded border focus:outline-none focus:ring-2" placeholder="请输入关键词" />
    </div>


    <div class="flex flex-col">
      <label class="text-sm mb-2">城市代码</label>
      <input type="text" v-model.lazy="queryCondition.city"
        class="px-3 py-2 max-w-24 rounded border focus:outline-none focus:ring-2" placeholder="请输入关键词" />
    </div>

    <div class="flex flex-col">
      <label class="text-sm mb-2">分组</label>
      <TaskGroupQueryBox v-model="groupQueryValue" :initial-group-id="queryCondition._groupId" />
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
import TaskGroupQueryBox from "@/components/lj/TaskGroupQueryBox.vue";
import { RentCommunityQueryCondition } from "@/types/query-condition";
import { cn } from "@/utils/shadcn-utils";
import { ref, watch, type HTMLAttributes } from 'vue';


const groupQueryValue = ref<{ groupId: number, name: string }>()
watch(groupQueryValue, (newValue) => {
  queryCondition.value._groupId = newValue?.groupId
})

// Props定义
interface Props {
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  class: undefined
})


// 双向绑定模型
const queryCondition = defineModel<RentCommunityQueryCondition>({
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
const resetCondition = () => {
  queryCondition.value = {}
  emit('update')
}

</script>