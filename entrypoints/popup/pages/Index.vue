<script setup lang="ts">


import {Switch} from "@/components/ui/switch";
import TabsCreate from "@/components/debug/TabsManage.vue";
import {browser} from "wxt/browser";
import {Button} from "@/components/ui/button";
import {sendMessage} from "webext-bridge/popup";


async function toggleSidePanel(payload: boolean) {
  if (payload) {
    const window = await browser.windows.getCurrent({})
    console.log("Current Window ID:", window.id);
    if (window.id)
      await browser.sidebarAction.open()
  }
}
async function openOptionHomePage() {
  sendMessage('openOptionPage','/options.html#/','background')

}

async function openStartUpPage(){
  sendMessage('openOptionPage','/options.html#/doc/startup','background')
}
const extname=import.meta.env.VITE_EXT_NAME

</script>

<template>

  <div class="p-2 text-nowrap">
    <h1> <span class="text-base">欢迎使用</span> <span class="text-primary">{{extname}}</span></h1>
    <div class="flex flex-col gap-2">
      <Button @click="openOptionHomePage">打开后台页面</Button>
      <Button @click="openStartUpPage" class="" variant="outline">查看使用说明</Button>
    </div>
  </div>
</template>

<style scoped>

</style>