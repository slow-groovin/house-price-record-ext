<script setup lang="ts">
import {HousePriceChangeItem} from "@/types/lj";
import {HTMLAttributes} from "vue";
import {cn} from "@/utils/shadcn-utils";
import {HouseDetailUrl} from "@/utils/url-component";

const props = defineProps<{
  list: HousePriceChangeItem[],
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div :class="cn('flex flex-wrap gap-x-4',props.class)">
    <div v-for="(item,index) in list" :key="item.hid" class="flex">
      <Component :is="HouseDetailUrl(item.hid)"/>:
      <span class="text-sm text-green-800  ml-2">
        {{ item.oldPrice }}
        <span class="text-black">-></span>
        {{ item.price }}
      </span>
    </div>

  </div>
</template>

<style scoped>

</style>