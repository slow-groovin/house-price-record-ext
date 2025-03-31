<template>

  <div class="flex flex-nowrap gap-2 items-center">
    <div class="shadow w-fit p-2 rounded">
      <div v-if="isRise" class="flex flex-row flex-nowrap gap-1 text-base ">
        <div class="mt-[0.5rem]">{{ oldValue }} {{ unit }}</div>
        <RiseArrow class="mt-2 h-4  rotate-[7deg] stroke-red-500 stroke-[4] "/>
        <div class="">{{ newValue }} {{ unit }}</div>
      </div>
      <div v-else class="flex flex-row flex-nowrap gap-1 text-base">
        <div class="">{{ oldValue }} {{ unit }}</div>
        <RiseArrow class="mt-2 h-4  rotate-[43deg] stroke-green-500 stroke-[4] "/>
        <div class="mt-[.5rem]">{{ newValue }} {{ unit }}</div>
      </div>
    </div>

    <div :class="diffClassName">
      ({{diffStr}}{{unit}})
    </div>
  </div>


</template>
<script setup lang="ts">

import RiseArrow from "@/components/svg/RiseArrow.vue";

const {oldValue,newValue}=defineProps<{
  oldValue: number | string | undefined | null,
  newValue: number | string | undefined | null,
  unit?: string
}>()

function translate(v?: number | string|null|undefined) {
  if (typeof v === 'number') {
    return v
  }
  if(v===null || v===undefined){
    return NaN
  }
  return Number.parseInt(v)
}
const oldNum=translate(oldValue)
const newNum=translate(newValue)

const isRise=newNum>oldNum

const diff=newNum-oldNum
const diffStr=diff<0
  ? String(diff)
  : `+${diff}`
const diffClassName=diff>0?'text-red-500':'text-green-500'
</script>

<style scoped>
</style>