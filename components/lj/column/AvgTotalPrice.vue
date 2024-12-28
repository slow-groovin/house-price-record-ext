<script setup lang="ts">
import {genOptionCommunityUrl,genCommunityPageUrl} from "@/utils/lj-url";
import {Icon} from "@iconify/vue";

const {value,change}=defineProps<{
  value?:number,
  change?:number,
}>()

const color= ()=>change?(change<0?'text-green-700':'text-red-500'):''
</script>

<template>
  <div v-if="value" class="flex flex-nowrap items-center">
    <div class="text-lg font-bold ">{{value}}万</div>
    <div v-if="change" class="text-sm font-bold" :class="color()">({{change>0?'+':''}}{{change}})</div>
  </div>


</template>

<style scoped>

</style>