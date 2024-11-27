<script setup lang="ts">

import {isCaptchaPage, isHousePage, isSoldHousePage} from "@/utils/lj-url";
import {browser} from "wxt/browser";
import {ref} from "vue";
import {Button} from "@/components/ui/button";
const curTabUrl= ref('')
async function updateCurTabUrl(){
  const tabs = await browser.tabs.query({ active: true, currentWindow: true})
  curTabUrl.value = tabs[0].url
}


</script>

<template>
<div class="c-block">
  <h1> url </h1>
  <span>cur tab url: <span class="text-blue-500 underline">{{curTabUrl}}</span></span>
  <Button @click="updateCurTabUrl">refresh</Button>
  <div>    isHousePage: {{isHousePage(curTabUrl)}}  </div>
  <div>    isSoldHousePage: {{isSoldHousePage(curTabUrl)}}  </div>
  <div>    isCaptchaPage: {{isCaptchaPage(curTabUrl)}}  </div>
</div>
</template>

<style scoped>

</style>