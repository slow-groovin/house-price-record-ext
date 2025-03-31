<template>
  <div class="w-fit flex flex-row items-center">
    <div class="flex flex-nowrap border p-2  w-fit rounded-lg text-nowrap text-xs" :class="variant[oldValue]?.color">
      <Icon v-if="variant[oldValue]?.icon" :icon="variant[oldValue].icon" class="w-4 h-4 mr-1"/>
      {{ HouseTaskStatusText[oldValue as HouseTaskStatus] }}
    </div>
    <Icon icon="mdi:arrow-right-thin" class=""/>
    <div class="flex flex-nowrap border p-2  w-fit rounded-lg text-nowrap text-xs" :class="variant[newValue]?.color">
      <Icon v-if="variant[newValue]?.icon" :icon="variant[newValue].icon" class="w-4 h-4 mr-1"/>
      {{ HouseTaskStatusText[newValue as HouseTaskStatus] }}
    </div>
  </div>
</template>
<script setup lang="ts">

import {Icon} from '@iconify/vue'
import {HouseTaskStatus, HouseTaskStatusText} from "@/types/lj";


const {oldValue, newValue} = defineProps<{ oldValue: number, newValue: number }>()

function translate(v: number | string) {
  if (typeof v === 'number') {
    return v
  }
  return Number.parseInt(v)
}

const variant: Record<number, { icon: string, color: string }> = {
  [HouseTaskStatus.running]: {icon: 'line-md:circle-twotone', color: 'bg-green-500 text-white'},
  [HouseTaskStatus.sold]: {icon: 'bi:cart-check', color: 'bg-blue-500 text-white'},
  [HouseTaskStatus.miss]: {icon: 'mdi:cart-off', color: 'bg-gray-500 text-white'},
  [HouseTaskStatus.void]: {icon: 'circum:no-waiting-sign', color: ''},

}
//
// const cOldValue=translate(props.oldValue??"")
// const cNewValue=translate(props.newValue??"")
//
//
//
// const presetKey = (oldS: HouseTaskStatus, newS: HouseTaskStatus) => `${oldS}-${newS}`
// const presets = new Map<string, any>([
//   [presetKey(HouseTaskStatus.void, HouseTaskStatus.running), {
//     color: 'bg-green-500',
//     key: 'content.community.change.statusConclusion.shelve'
//   }],
//   [presetKey(HouseTaskStatus.running, HouseTaskStatus.sold), {
//     color: 'bg-gray-500',
//     key: 'content.community.change.statusConclusion.unshelve'
//   }],
//
//   [presetKey(HouseTaskStatus.running, HouseTaskStatus.miss), {
//     color: 'bg-red-500',
//     key: 'content.community.change.statusConclusion.invalid'
//   }],
//   ])
//
// const key = presetKey(oldValue, newValue)
// const isPreset = ref(presets.has(key))
// const presetItem = presets.get(key)
//
// // console.log(key, isPreset.value, presetItem)

</script>

<style scoped>

</style>