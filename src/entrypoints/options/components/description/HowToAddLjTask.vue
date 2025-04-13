<script setup lang="ts">
import Code from '@/components/information/Code.vue';
import InfoHover from '@/components/information/InfoHover.vue';
import { GroupIdType } from '@/types/group';
import { InfoIcon } from 'lucide-vue-next';
import { computed } from 'vue';
const { type = 'ljSellCid' } = defineProps<{
  type?: GroupIdType
}>()
const pageName = computed(() => {
  if (type === 'ljSellCid') {
    return '二手房小区页面'
  }
  if (type === 'keRentCid') {
    return '租房小区页面'
  }

})
const webpUrl = computed(() => {
  if (type === 'ljSellCid') {
    return '/desc/sell.2.add-task.webp'
  }
  if (type === 'keRentCid') {
    return '/desc/rent.2.add-task.webp'
  }
})
</script>

<template>
  <InfoHover>
    <template #trigger>
      <div class="flex items-center hover:bg-neutral-200 rounded text-xs">
        如何添加任务?
        <InfoIcon class="size-5" />
      </div>
    </template>

    打开一个<Code>{{ pageName }}</Code>, 从右侧的插件浮窗页面中点击添加任务
    <img :src="webpUrl" alt="" class="max-w-[800px] mt-4">
  </InfoHover>
</template>