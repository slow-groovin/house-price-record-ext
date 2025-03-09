<script setup lang="ts">


import { HTMLAttributes } from "vue";
const props = defineProps<{
  text?: string,
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div class="bg-gray-200 px-2 rounded inline-flex items-center">
    <slot>
      {{ text }}
    </slot>
  </div>
</template>

<style scoped></style>