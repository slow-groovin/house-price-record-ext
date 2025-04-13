<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {Component, defineAsyncComponent} from "vue";
import {browser} from "wxt/browser";
// import DebugEntryTabs from "@/components/debug/DebugEntryTabs.vue";
let DebugEntryTabs:Component;

if (import.meta.env.MODE === 'development') {
  DebugEntryTabs = defineAsyncComponent(() => import('@/components/debug/DebugEntryTabs.vue'));
}

async function openSidePanel() {
  const window = await browser.windows.getCurrent({})
  console.log("Current Window ID:", window.id);
  if (window.id)
    browser.sidePanel.open({windowId: window.id})
}

</script>

<template>
  <div class="c-block items-start">
    <Button @click="openSidePanel">Open SidePanel</Button>
    <DebugEntryTabs/>
  </div>


</template>

<style scoped>

</style>