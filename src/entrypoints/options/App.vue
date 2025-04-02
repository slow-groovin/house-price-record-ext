<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner'
import { useExtTitle } from "@/composables/useExtInfo";
useExtTitle('后台')
const dev = import.meta.env.DEV
</script>

<template>
  <div id="options-container">
    <Toaster expand rich-colors closeButton position="top-right" />
    <RouterView />
    <div hidden aria-label="dev">{{ dev }}</div>
  </div>


</template>

<style scoped></style>
