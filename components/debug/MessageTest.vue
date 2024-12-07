<script setup lang="ts">

import {sendMessage as optionsSend} from "webext-bridge/options";
import {sendMessage as contentSend} from "webext-bridge/content-script";

import {ref, Ref} from "vue";
import SelectButton from "@/components/custom/SelectButton.vue";

async function sendSimple() {
  const sendMessage= source.value==='options'?optionsSend:contentSend
  console.log('sendMessage to ' + target.value,msgKey.value)
  const rs = await sendMessage(msgKey.value, 'ok', target.value)
  console.log('simple response:')
  console.log(rs)
}

const source: Ref<'background' | 'content-script' | 'options'> = ref('background')
const target: Ref<'background' | 'content-script' | 'options'> = ref('background')
const msgKey = ref('simple')
</script>

<template>
  <h1> sendMessage accessible test</h1>
  <div>
    <div>
      source
      <SelectButton v-model="source" :value="'background'">background</SelectButton>
      <SelectButton v-model="source" :value="'content-script'">content-script</SelectButton>
      <SelectButton v-model="source" :value="'options'">options</SelectButton>
    </div>
    <div>
      target:
      <SelectButton v-model="target" :value="'background'">background</SelectButton>
      <SelectButton v-model="target" :value="'content-script'">content-script</SelectButton>
      <SelectButton v-model="target" :value="'options'">options</SelectButton>
    </div>

    <input v-model="msgKey" type="text" placeholder="message key">

    <button @click="sendSimple()" class="border">sendMessage:simple</button>

  </div>
</template>

<style scoped>

</style>