<script setup lang="ts">
import {onMounted} from 'vue'
import {useRoute} from "vue-router";
const {query}=useRoute()
const target=query.target


const targetMap={
  'startup': {title:'入门指南'},
  'about':{title:'关于'},
}
const baseDocUrl='https://doc.hp-ext.api2o.com/'

const url=baseDocUrl
onMounted(()=>{
  // autoResetIframeHeight()
})
</script>

<template>
  <h1 class="text-3xl my-4 font-bold">{{targetMap[target]?.title??'文档'}}</h1>
  <a :href="url" target="_blank" class="link">访问网站</a>
  <div class="outline">
    <iframe id="contentFrame" :src="url" sandbox=""  class="w-full h-fit min-h-screen"></iframe>
  </div>

</template>

<style scoped>

</style>