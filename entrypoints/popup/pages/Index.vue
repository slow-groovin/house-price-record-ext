<script setup lang="ts">


import {Switch} from "@/components/ui/switch";

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
</template>

<style scoped>

</style>