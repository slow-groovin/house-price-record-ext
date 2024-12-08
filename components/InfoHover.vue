<script setup lang="ts">

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Icon } from '@iconify/vue'
</script>

<template>
  <HoverCard :open-delay="10" :close-delay="10">
    <HoverCardTrigger class="text-inherit   no-underline">
      <Icon icon="stash:exclamation-circle" class="w-6 h-6  text-gray-500 hover:bg-gray-300 rounded " />
    </HoverCardTrigger>
    <HoverCardContent class="w-fit ">
      <slot/>
    </HoverCardContent>
  </HoverCard>
</template>

<style scoped>

</style>