<template>
  <SimpleDrawer class="fixed top-16 right-0 h-fit text-sm " :default-open="true" :position="'right'">
    <div class="p-2 border rounded-t-lg rounded-b shadow-xl shadow-neutral-400 mr-2 bg-white">
      <h1
        class="flex items-center gap-2 justify-center mb-2  border-b-2 border-neutral-300  hover:underline hover:cursor-pointer"
        @click="openOption" title="去后台页面">
        <img :src="icon" alt="icon" class="inline size-4">
        <span class="text-primary">{{ name }}</span>
        <span class="text-xs ">{{ version }}</span>
      </h1>
      <slot></slot>

    </div>
  </SimpleDrawer>
</template>
<script setup lang="tsx">
import { useExtInfo } from '@/composables/useExtInfo';
import SimpleDrawer from './SimpleDrawer.vue';
import icon from '~/assets/24.png'
import { sendMessage } from '@/messaging';
/**
 * content.js unified Container
 */
const { name, version } = useExtInfo()
function openOption() {
  sendMessage('openOptionPage', '/options.html#/')
}
</script>