<script setup lang="ts">


import {Switch} from "@/components/ui/switch";
import TabsCreate from "@/components/debug/tabs-create.vue";
import DexieIndexedDB from "@/components/debug/DexieIndexedDB.vue";

async function log(){
  const oldRules=await browser.declarativeNetRequest.getDynamicRules()
  console.log(oldRules)
}
</script>

<template>

  <div class="c-block">
    <h1>Popup</h1>
    <div>
      <Switch id="airplane-mode" />
      <label for="airplane-mode">Airplane Mode</label>
    </div>
  </div>
  <TabsCreate/>
  <DexieIndexedDB/>

</template>

<style scoped>

</style>