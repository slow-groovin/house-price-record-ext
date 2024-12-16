<script setup lang="ts">
import {genOptionCommunityUrl,genCommunityPageUrl} from "@/utils/lj-url";
import {Icon} from "@iconify/vue";

const {id,name}=defineProps<{
  name?:string,
  id?:string,
  city?:string,
}>()

</script>

<template>
  <div class="text-xs">
    <div class="flex">
      <a v-if="id" :href="genOptionCommunityUrl(id)" class="link " target="_blank">
        <div>{{id}}</div>
      </a> &nbsp;&nbsp;&nbsp;
    </div>
    <div class="text-nowrap flex flex-nowrap">
      {{ name }}
      <a class="inline-block link text-base hover:bg-gray-200" :href="genCommunityPageUrl(city??'',id??'',1)" target="_blank"
         rel="noreferrer">
        <Icon icon="tdesign:jump"/>
      </a>
    </div>
  </div>

</template>

<style scoped>

</style>