<script setup lang="ts">

import DebugEntryTabs from "@/components/debug/DebugEntryTabs.vue";
import {Toaster} from "vue-sonner";
</script>

<template>
  <div class="w-fit fixed top-0 left-1/2">
    <Toaster position="top-left" />
    <DebugEntryTabs/>
  </div>

</template>

<style scoped>

</style>