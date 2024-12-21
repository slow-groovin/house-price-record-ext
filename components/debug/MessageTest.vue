<script setup lang="ts">
import {sendMessage} from "@/messaging";

import {ref} from "vue";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";

async function sendSimple() {
  console.log('sendMessage to ', msgKey.value, tabId.value,)
  let rs: any
  //@ts-ignore
  if (tabId.value) {
    rs = await sendMessage(msgKey.value, 'ok', tabId.value)
  } else {
    rs = await sendMessage(msgKey.value, 'ok')
  }
  console.log('simple response:')
  console.log(rs)
}

async function sendCommunityPageMsg() {
  let rs: any
  if (tabId.value) {
    rs = await sendMessage('parseOneCommunityListOnePage', undefined, tabId.value)
  } else {
    rs = await sendMessage('parseOneCommunityListOnePage', undefined)
  }
  console.log('rs:', rs)
}

const msgKey = ref('simple')
const tabId = ref<number>(0)
</script>

<template>
  <h1> sendMessage accessible test</h1>
  <div>
    <input v-model="msgKey" type="text" placeholder="message key">
    <input v-model="tabId" type="number" placeholder="tabId">

    <button @click="sendSimple()" class="border">sendMessage:simple</button>

    <Separator/>
    <button @click="sendCommunityPageMsg"> send community page msg</button>

  </div>
</template>

<style scoped>

</style>