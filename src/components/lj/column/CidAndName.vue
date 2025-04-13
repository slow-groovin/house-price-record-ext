<script setup lang="ts">
import { genOptionCommunityUrl, genCommunityPageUrl, genKeRentCommunityPageUrl, genOptionKeRentCommunityUrl } from "@/utils/lj-url";
import { Icon } from "@iconify/vue";

const { id, name, type = 'lj-sell' } = defineProps<{
  name?: string,
  id?: string,
  city?: string,
  type?: 'lj-sell' | 'ke-rent'
}>()
const genOptionUrlFuncMap = {
  'lj-sell': genOptionCommunityUrl,
  'ke-rent': genOptionKeRentCommunityUrl,
}
const genCommunityUrlFuncMap = {
  'lj-sell': genCommunityPageUrl,
  'ke-rent': genKeRentCommunityPageUrl,
}

</script>

<template>
  <div class="text-xs">
    <div class="flex">
      <a v-if="id" :href="genOptionUrlFuncMap[type](id)" class="link " target="_blank">
        <div>{{ id }}</div>
      </a> &nbsp;&nbsp;&nbsp;
    </div>
    <div class="text-nowrap flex flex-nowrap">
      {{ name }}
      <a class="inline-block link text-base hover:bg-gray-200" :href="genCommunityUrlFuncMap[type](city ?? '', id ?? '', 1)"
        target="_blank" rel="noreferrer">
        <Icon icon="tdesign:jump" />
      </a>
    </div>
  </div>

</template>

<style scoped></style>