<template>
  <div class="flex flex-nowrap rounded-md shadow-sm gap-0.5">
    <template v-for="(button, index) in buttons" :key="index">
      <button v-if="button.count" class="px-1 text-sm rounded " :class="button.color" @click="button.onClick"
        :disabled="!button.count">
        ⯈{{ button.text }}({{ button.count }})
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { goRunGroupTask } from '@/entrypoints/reuse/group-control';
import { TaskGroup2 } from '@/types/group';

const { group } = defineProps<{
  group: TaskGroup2
}>()


const buttons = [
  { text: '小区', color: 'bg-green-700 text-white', count: group.ljSellCidList.length, onClick: () => goRunGroupTask(group, 'ljSellCid') },
  { text: '房源', color: 'bg-green-300 text-gray-700', count: group.ljSellHidList.length, onClick: () => goRunGroupTask(group, 'ljSellHid') },
  { text: '租房', color: 'bg-blue-500 text-white', count: group.keRentCidList.length, onClick: () => goRunGroupTask(group, 'keRentCid') },
];
</script>
