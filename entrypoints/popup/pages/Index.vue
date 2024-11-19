<script setup lang="ts">


import {Switch} from "@/components/ui/switch";
import TabsCreate from "@/components/debug/tabs-create.vue";

async function log(){
  const oldRules=await browser.declarativeNetRequest.getDynamicRules()
  console.log(oldRules)
}



function toggleSidePanel(payload:boolean){
  if(payload){
    browser.windows.getCurrent({}, (window) => {
      console.log("Current Window ID:", window.id);
      if(window.id)
        browser.sidePanel.open({windowId:window.id})
    });
  }
}



</script>

<template>

  <div class="c-block">
    <h1>Popup</h1>
    <div>
      <Switch id="airplane-mode" />
      <label for="airplane-mode">Airplane Mode</label>

      <Switch id="side-panel-state" @update:checked="toggleSidePanel" />
      <label for="side-panel-state" >SidePanel</label>


      <TabsCreate/>
    </div>
  </div>
</template>

<style scoped>

</style>