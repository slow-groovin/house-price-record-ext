<script setup lang="ts">

import {Toaster} from "vue-sonner";
import {Component, defineAsyncComponent} from "vue";
// import DebugEntryTabs from "@/components/debug/DebugEntryTabs.vue";
let DebugEntryTabs:Component;

if (import.meta.env.MODE === 'development') {
  DebugEntryTabs = defineAsyncComponent(() => import('@/components/debug/DebugEntryTabs.vue'));
}
</script>

<template>
  <div class="w-fit fixed top-0 left-1/2">
    <Toaster position="top-left" />
    <DebugEntryTabs/>
  </div>

</template>

<style scoped>

</style>