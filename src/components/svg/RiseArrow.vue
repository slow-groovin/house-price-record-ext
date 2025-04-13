<script setup lang="ts">
import {cn} from "@/utils/shadcn-utils";

const props=defineProps<{
  class?:string
}>()
</script>

<template>
  <svg viewBox="0 0 100 50"  xmlns="http://www.w3.org/2000/svg" :class="cn('',props.class)">
    <!-- Created with SVG-edit - https://github.com/SVG-Edit/svgedit-->
    <g class="layer" display="inline">
      <title>Layer 1</title>
      <path transform="scale(1 1)" d=""/>
      <line x1="4.5" x2="93.75" y1="44.38" y2="6.63"/>
      <line x1="89.5" x2="93" y1="19.13" y2="6.63"/>
      <line x1="82.75" x2="93.5" y1="3.13" y2="6.38"/>
    </g>
  </svg>
</template>

<style scoped>

</style>