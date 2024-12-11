<script lang="ts" setup>
import { Toaster } from '@/components/ui/sonner'


</script>

<template>
  <div id="options-container">
    <Toaster expand rich-colors closeButton position="top-right" />
    <RouterView/>

  </div>


</template>

<style scoped>

</style>
