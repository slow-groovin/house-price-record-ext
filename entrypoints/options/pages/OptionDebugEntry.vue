<script setup lang="ts">
import {Button} from "@/components/ui/button";
import DebugEntryTabs from "@/components/debug/DebugEntryTabs.vue";

function openSidePanel() {
  browser.windows.getCurrent({}, (window) => {
    console.log("Current Window ID:", window.id);
    if (window.id)
      browser.sidePanel.open({windowId: window.id})
  });
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