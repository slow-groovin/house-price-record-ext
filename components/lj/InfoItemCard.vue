<script setup lang="ts">

import {Icon} from "@iconify/vue";
import {cn} from "@/utils/shadcn-utils";
import {Card, CardContent, CardDescription, CardHeader} from "@/components/ui/card";
import {HTMLAttributes} from "vue";
import InfoHover from "@/components/InfoHover.vue";
const props=defineProps<{
  name:string,
  value?:number|string,
  desc?:string,
  type?: 'money' | 'count' | 'area' | 'date',
  postfix?:string,
  icon?:string,
  class?:HTMLAttributes['class']
}>()
function getIcon(icon?: string, type?: 'money' | 'count' | 'area' | 'date') {
  if (icon) return icon
  switch (type) {
    case 'money':
      return 'mingcute:currency-cny-2-line'
    case 'count':
      return 'f7:number'
    case 'area':
      return 'material-symbols:house'
    case 'date':
      return 'clarity:date-line'
    default:
      return 'ant-design:number-outlined'
  }
}
</script>

<template>
  <Card :class=" cn('w-fit min-w-[10em]',props.class)">
    <CardHeader class="p-2 flex flex-row items-center justify-between space-y-0 pb-2 ">
      <CardDescription>
        <div class="flex items-center">
          {{name}}
          <slot name="hoverDesc">
            <InfoHover v-if="desc" class="w-4 h-4">
              {{desc}}
            </InfoHover>
          </slot>

        </div>

      </CardDescription>
      <Icon :icon="getIcon(icon,type)"/>
    </CardHeader>
    <CardContent class="">
      <slot/>
      <div v-if="!$slots.default" class="flex  text-center text-2xl font-bold">
        <span v-if="type==='money'">
          ￥
        </span>


        <span v-if="value">
          {{value?.toLocaleString()}}
          <span>{{postfix}}</span>
        </span>
        <span v-else>-</span>

      </div>
    </CardContent>
  </Card>
</template>

<style scoped>

</style>