<template>
  <div class="fixed bottom-1 right-1 bg-background/50 shadow-lg rounded-full p-4 space-y-2 text-primary/50
    hover:bg-background   hover:text-primary active:border-foreground/50 active:border "
       @click="scrollToTop"
  >
    <div
      class="  hover:underline"

    >
      <Icon icon="cil:caret-top" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import {scrollToId} from "@/utils/document";

const props = defineProps<{ topAnchorId?: string }>()



function scrollToTop() {
  scrollToId(props.topAnchorId ?? '__top_anchor')
}


</script>

<style scoped>
/* 可以根据需要添加自定义样式 */
</style>
