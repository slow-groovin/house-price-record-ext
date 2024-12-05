<template>
  <span class=" border-2 border-primary p-1  w-fit rounded-lg text-nowrap ">
    <span class="">{{ oldValue }} {{unit}}</span>
    <span class="mx-0.5">
      <span v-if="!oldValue || !newValue">
        <Icon icon="streamline:graph-arrow-decrease-solid" class="inline text-green-700 "/>
      </span>
      <span v-else-if="translate(oldValue)>translate(newValue)">
        <Icon icon="streamline:graph-arrow-decrease-solid" class="inline text-green-700 mr-0.5"/>
<!--        <Icon icon="streamline:graph-arrow-decrease-solid" class="inline text-green-700 "/>-->
        <span class=" bg-green-600 text-white rounded  shadow-lg shadow-green-600/50">
          ({{ translate(newValue) - translate(oldValue) }})
        </span>
      </span>
      <span v-else>
        <Icon icon="streamline:graph-arrow-increase-solid" class="inline text-red-600 mr-0.5"/>
<!--        <Icon icon="streamline:graph-arrow-increase-solid" class="inline text-red-600 "/>-->
        <span class="bg-red-700 text-white rounded  shadow-lg shadow-red-600/50">
          (+{{ translate(newValue) - translate(oldValue) }})
        </span>
      </span>
    </span>
    <span class="">{{ newValue }} {{unit}}</span>
  </span>
</template>
<script setup lang="ts">

import { Icon } from '@iconify/vue'

defineProps<{oldValue:number|string|undefined|null,newValue:number|string|undefined|null,unit?:string}>()
function translate(v:number|string){
  if(typeof v ==='number'){
    return v
  }
  return Number.parseInt(v)
}
</script>

<style scoped>
</style>