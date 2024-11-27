<script setup lang="ts">


import {Switch} from "@/components/ui/switch";
import TabsCreate from "@/components/debug/TabsManage.vue";
import {browser} from "wxt/browser";


async function toggleSidePanel(payload: boolean) {
  if (payload) {
    const window = await browser.windows.getCurrent({})
    console.log("Current Window ID:", window.id);
    if (window.id)
      await browser.sidebarAction.open()
  }
}


</script>

<template>

  <div class="c-block">
    <h1>Popup</h1>
    <div>
      <Switch id="airplane-mode"/>
      <label for="airplane-mode">Airplane Mode</label>

      <Switch id="side-panel-state" @update:checked="toggleSidePanel"/>
      <label for="side-panel-state">SidePanel</label>


      <TabsCreate/>
    </div>
  </div>
</template>

<style scoped>

</style>