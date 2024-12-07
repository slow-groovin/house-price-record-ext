<template>
  <span class=" border-2 p-1 mr-2 w-fit rounded text-nowrap " :class="borderClassName">
    <span class="">{{ oldValue }} {{ unit }}</span>
    <span class="mx-0.5">
       <span v-if="isRise">
        <Icon icon="streamline:graph-arrow-increase-solid" class="inline text-red-600 mr-0.5"/>
      </span>
      <span v-else>
        <Icon icon="streamline:graph-arrow-decrease-solid" class="inline text-green-700 mr-0.5"/>
      </span>
    </span>
    <span class="">{{ newValue }} {{ unit }}</span>

  </span>
  <span :class="diffClassName">({{ diffStr }}{{unit}})</span>

</template>
<script setup lang="ts">

import {Icon} from '@iconify/vue'
import {toInt} from "radash";

const {oldValue,newValue}=defineProps<{
  oldValue: number | string | undefined | null,
  newValue: number | string | undefined | null,
  unit?: string
}>()

function translate(v: number | string|null|undefined) {
  if (typeof v === 'number') {
    return v
  }
  if(v===null || v===undefined) return NaN
  return toInt(v)
}
const oldNum=translate(oldValue)
const newNum=translate(newValue)

const isRise=newNum>oldNum

const diff=newNum-oldNum
const diffStr=diff<0
  ? String(diff)
  : `+${diff}`

const diffClassName=isRise?'text-red-500':'text-green-500'
const borderClassName=isRise?'border-red-500':'border-green-500'
</script>

<style scoped>
</style>