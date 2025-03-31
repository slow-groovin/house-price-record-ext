<script setup lang="ts">
import {computed, type HTMLAttributes} from 'vue'
import { XCircle } from 'lucide-vue-next'
import {cn} from "@/utils/shadcn-utils";

/**
 * Prompt: Create a Vue 3 component using Composition API, Tailwind CSS, TypeScript, and flex layout
 * to represent a simple empty state page. The component should be headless, use the `cn` function
 * for style mixing, and include concise comments for different blocks and functions.
 *
 * EmptyState is a versatile component that displays a message when there's no data to show.
 * It's customizable through props and provides a clean, centered layout with an icon, title, and description.
 */

interface Props {
  title?: string
  description?: string
  class?: HTMLAttributes['class']
}

// Define component props with default values
const props = withDefaults(defineProps<Props>(), {
  title: 'No data available',
  description: 'There are no items to display at this time.',
})

// Compute the final class string using the cn function
const containerClass = computed(() =>
  cn('flex flex-col items-center justify-center  text-center', props.class)
)
</script>

<template>
  <!-- Main container for the empty state -->
  <div :class="containerClass">
    <!-- Icon representation -->
    <XCircle class="w-16 h-16 text-gray-400 mb-4" />

    <!-- Title of the empty state -->
    <h3 class="text-lg font-semibold text-gray-900 mb-1">
      {{ title }}
    </h3>

    <!-- Description of the empty state -->
    <p class="text-sm text-gray-500">
      {{ description }}
    </p>
  </div>
</template>