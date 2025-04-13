<script setup lang="ts">

import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Icon } from '@iconify/vue'
import {cn} from "@/utils/shadcn-utils";

import {HTMLAttributes} from "vue";
const props=defineProps<{
  class?:HTMLAttributes['class']
}>()
</script>

<template>
  <HoverCard :open-delay="10" :close-delay="10">
    <HoverCardTrigger class="">
      <slot name="trigger">
        <Icon icon="stash:exclamation-circle" :class="cn('inline-block w-6 h-6  text-gray-500 hover:bg-gray-300 rounded',props.class) " />
      </slot>
    </HoverCardTrigger>
    <HoverCardContent class="w-fit ">
      <slot/>
    </HoverCardContent>
  </HoverCard>
</template>

<style scoped>

</style>