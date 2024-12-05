<!--仿照lemon Squeezy 价格变换标签的实现-->
<script setup lang="ts">

import { Icon } from '@iconify/vue'
import type { HTMLAttributes } from 'vue'
import {cn} from "@/utils/shadcn-utils";


const props = defineProps<
  { value: number, type: 'percent' | 'number', suffix?: string }
  & { class?: HTMLAttributes['class'] }
>()

function formatValue(value: number, type: 'percent' | 'number') {
  if (type === 'number') return value
  else return formatPercent(value) + '%'

}

function formatPercent(num: number) {
  if (Math.abs(num) < 2) {
    // 如果小于2，保留最多两位小数
    let numStr = num.toFixed(20) // 将数字转换为字符串，并且固定保留20位小数
    let decimalIndex = numStr.indexOf('.') // 找到小数点的位置
    let decimalLength = numStr.substring(decimalIndex + 1).length // 计算小数部分的长度
    if (decimalLength > 2) {
      return num.toFixed(2) // 小数部分超过两位时截取两位小数
    } else {
      return num // 小数部分不超过两位时保留原样
    }
  } else {
    // 如果大于等于2，不保留小数
    return Math.floor(num)
  }
}

function additionClassByValue(value: number) {
  if (value > 0)
    return 'bg-red-200/25 text-red-700'
  else
    return 'bg-green-200/25 text-green-700'
}

function iconByValue(value: number) {
  if (value > 0)
    return 'ri:arrow-up-line'
  else
    return 'ri:arrow-down-line'

}
</script>

<template>
  <div v-if="value!=0"
       :class="cn('  ml-1 rounded-xl max-w-fit pr-0.5   flex flex-row text-nowrap', props.class,additionClassByValue(value))">
    <Icon :icon="iconByValue(value)" class=" align-middle" height="1.25em" />
    <span class=" ">{{ formatValue(value, type) }}  </span>

    <span v-if="suffix" class=" text-neutral-600  font-normal  self-end ">
      <span class="text-neutral-200">&nbsp;|</span>
      {{ suffix }}
    </span>
<!--    text-[.8em] leading-[.8em]  mb-1 -->
<!--    注意: inline的align-vertical被flex的align覆盖-->
  </div>


</template>

<style scoped>

</style>