<template>
  <SimpleDrawer class="fixed top-16 right-0 h-fit text-sm " v-if="isReady && defaultExpand !== null"
    :default-open="defaultExpand" toggle-class="bg-primary text-white" :position="'right'">
    <div class="flex flex-col w-fit mr-2 p-2 border rounded-t-lg rounded-b shadow-xl shadow-neutral-400  bg-white">
      <h1
        class="flex items-center gap-2 justify-center mb-2  border-b-2 border-neutral-300  hover:underline hover:cursor-pointer"
        @click="openOption" title="去后台页面">
        <img :src="icon" alt="icon" class="inline size-4">
        <span class="text-primary">{{ name }}</span>
        <span class="text-xs ">{{ version }}</span>
      </h1>
      <slot></slot>

      <!-- bottom -->
      <div v-if="isReady && defaultExpand !== null" class="flex items-center p-1 bg-white text-xs font-light  self-end">
        <label class="mr-[-.25rem]">
          打开页面时默认展开
        </label>
        <Switch v-model:checked="defaultExpand" class="scale-50 will-change-transform">

        </Switch>


      </div>
    </div>

  </SimpleDrawer>
</template>
<script setup lang="tsx">
import { useExtInfo } from '@/composables/useExtInfo';
import SimpleDrawer from './SimpleDrawer.vue';
import icon from '~/assets/24.png'
import { sendMessage } from '@@/messaging';
import { Switch } from '../ui/switch';
import useWxtStorage from '@/composables/useWxtStorage';
/**
 * content.js unified Container
 */
const { name, version } = useExtInfo()
function openOption() {
  sendMessage('openOptionPage', '/options.html#/')
}

const { state: defaultExpand, isReady } = useWxtStorage('local:panel-default-expand', true)
</script>