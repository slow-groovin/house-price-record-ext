<script setup lang="ts">
import { formatDistanceToNowHoursOrDays } from "@/utils/date";

const { price, relatedData, unit = '万', linkFunc = (id) => `options.html#/h/task/detail?id=${id}` } = defineProps<{
  price?: number,
  id?: string,
  relatedData?: {
    priceInit?: number,
    priceMax?: { value: number, at?: number },
    priceMin?: { value: number, at?: number },
    priceChangeCount?: number,
    priceLastChange?: { value: number, at: number }
  },
  relatedType?: 'last' | 'max' | 'min' | 'init' | 'count'
  unit?: string,
  linkFunc?: (id: string) => string,
}>()

</script>

<template>
  <a v-if="price" class="flex flex-row flex-nowrap items-end" :class="{ 'pointer-events-none': !id }"
    :href="linkFunc(id ?? '')" target="_blank" title="查看详情">
    <div class="font-bold text-green-500 italic">
      {{ price }}{{ unit }}
    </div>
    <div class="flex text-xs font-semibold italic ml-1 hover:underline">
      <div v-if="relatedType === 'init' && relatedData?.priceInit" class="text-blue-600">
        ({{ relatedData?.priceInit }}{{ unit }})
      </div>
      <div v-if="relatedType === 'max' && relatedData?.priceMax" class="text-rose-600">
        ({{ relatedData?.priceMax?.value }}{{ unit }})
      </div>
      <div v-if="relatedType === 'min' && relatedData?.priceMin" class="text-cyan-400">
        ({{ relatedData?.priceMin?.value }}{{ unit }})
      </div>
      <div v-if="relatedType === 'count' && relatedData?.priceChangeCount" class="text-amber-500">
        ({{ relatedData?.priceChangeCount }}次)
      </div>
      <div v-if="relatedType === 'last' && relatedData?.priceLastChange">
        ({{ relatedData?.priceLastChange?.value }}{{ unit
        }}@{{ formatDistanceToNowHoursOrDays(relatedData?.priceLastChange?.at)?.replace(' ', '') }})
      </div>

    </div>
  </a>
</template>

<style scoped></style>