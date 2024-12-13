<script setup lang="ts">
import {genOptionCommunityUrl} from "@/utils/lj-url";

const {id,name}=defineProps<{
  name?:string,
  id?:string
}>()

</script>

<template>
  <div class="text-xs">
    <div class="flex">
      <a v-if="id" :href="genOptionCommunityUrl(id)" class="link " target="_blank">
        <div>{{id}}</div>
      </a> &nbsp;&nbsp;&nbsp;
    </div>
    <div>{{name}}</div>
  </div>

</template>

<style scoped>

</style>