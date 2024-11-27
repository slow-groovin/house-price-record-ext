<template>
  <header :class="cn('flex items-center justify-between bg-[#1a1f36] px-4 py-2', props.class)">
    <div class="flex flex-col">
      <div class="flex items-center gap-2">
        <slot name="logo" />
        <h1 class="text-white text-xl font-medium">{{ title }}</h1>
      </div>
      <span class="text-gray-400 text-sm">v{{ version }}</span>
    </div>

    <nav class="flex items-center gap-6">
      <slot name="navigation">
        <template v-for="link in links" :key="link.text">
          <a
              :href="link.href"
              class="text-white hover:text-gray-300 text-sm transition-colors"
          >
            {{ link.text }}
          </a>
        </template>
      </slot>
    </nav>
  </header>
</template>

<script setup lang="ts">
import type {HTMLAttributes} from 'vue'
import {cn} from '@/utils/shadcn-utils'

interface Link {
  text: string
  href: string
}

interface Props {
  title: string
  version: string
  links?: Link[]
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  version: '1.0.0',
  links: () => [],
})
</script>