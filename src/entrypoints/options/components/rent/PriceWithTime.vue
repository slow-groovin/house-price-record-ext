<script setup lang="ts">
import { formatDistanceToNowHoursOrDays } from "@/utils/date";

const { price, relatedData } = defineProps<{
  price?: number,
  rid?: string,
  relatedData?: {
    priceInit?: number,
    priceMax?: { value: number, at?: number },
    priceMin?: { value: number, at?: number },
    priceChangeCount?: number,
    priceLastChange?: { value: number, at: number }
  },
  type?: 'last' | 'max' | 'min' | 'init'
}>()


</script>

<template>
  <!-- <pre>{{ relatedData }} {{ type === 'init' && relatedData?.priceInit }}</pre> -->
  <div v-if="price" class="flex flex-row flex-nowrap items-end">

    <div v-if="type === 'init' && relatedData?.priceInit && relatedData?.priceInit === price">
      -
    </div>
    <div v-else-if="type === 'max' && relatedData?.priceMax && relatedData?.priceMax.value === price">
      -
    </div>
    <div v-else-if="type === 'min' && relatedData?.priceMin && relatedData?.priceMin.value === price">
      -
    </div>
    <div v-else-if="type === 'last' && relatedData?.priceLastChange && relatedData?.priceLastChange.value === price">
      -
    </div>


    <div v-else-if="type === 'init' && relatedData?.priceInit" class="text-blue-600">
      {{ relatedData?.priceInit }}
    </div>
    <div v-else-if="type === 'max' && relatedData?.priceMax" class="text-rose-600">
      {{ relatedData?.priceMax?.value }}{{
        relatedData.priceMax?.at ? '@' + formatDistanceToNowHoursOrDays(relatedData?.priceMax?.at)?.replace(' ', '') : ''
      }}
    </div>
    <div v-else-if="type === 'min' && relatedData?.priceMin" class="text-cyan-400">
      {{ relatedData?.priceMin?.value }}{{
        relatedData.priceMin?.at ? '@' + formatDistanceToNowHoursOrDays(relatedData?.priceMin?.at)?.replace(' ', '') : ''
      }}
    </div>
    <div v-else-if="type === 'last' && relatedData?.priceLastChange">
      {{ relatedData?.priceLastChange?.value }}@{{
        formatDistanceToNowHoursOrDays(relatedData?.priceLastChange?.at)?.replace(' ', '') }}
    </div>

  </div>
</template>

<style scoped></style>