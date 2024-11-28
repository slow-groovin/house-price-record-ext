<script setup lang="tsx">

import {isCaptchaPage, isHousePage, isHouseSoldPage} from "@/utils/lj-url";
import {browser} from "wxt/browser";
import {ref} from "vue";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {useLocalStorage} from "@vueuse/core";
import {FlexRender} from "@tanstack/vue-table";

const curTabUrl = ref('')

async function updateCurTabUrl() {
  const tabs = await browser.tabs.query({active: true, currentWindow: true})
  curTabUrl.value = tabs[0].url ?? ''
}

const url = useLocalStorage('debug-fetch-url', '')

async function testFetch() {
  console.log('fetch:', url.value)
  try{
    const rs = await fetch(url.value,{redirect:'follow'})
    console.log(rs.status, rs.url,rs)
    console.log('content SIMPLE:', (await rs.text()).substring(0, 100),rs)
  }catch (e){
    console.log('error:',e)

  }
}

/**
 * tsx
 */
const Foo = (props: {msg: string}) => {
  return <div> Foo:{props.msg} </div>
}
const SimpleTsx=<div>SimpleTsx</div>
const StyleTsx=<div class="border p-2 m-3 bg-green-300">SimpleTsx</div>

async function openSidePanel(){
  if (typeof chrome !== "undefined" && chrome.sidePanel) {
  	// Chrome 或 Edge
    console.log('[side-panel] is chrome!')
    const tabs = await browser.tabs.query({active: true, currentWindow: true})

  	await chrome.sidePanel.open({tabId: tabs[0].id as number});
    await chrome.sidePanel.setOptions({
      path: "/sidepanel.html#/debug"
    })
  } else if (typeof browser !== "undefined" && browser.sidebarAction) {
  	// Firefox
    console.log('[side-panel] is firefox!')

  	browser.sidebarAction.setPanel({ panel: "sidebar.html#/debug" });
  } else {
  	console.log("[side-panel]Side Panel API not supported in this browser.");
  }
}

function logBrowserSidePanelRelated(){
  console.log('browser.sidePanel',browser.sidePanel)
  console.log('browser.sidebarAction',browser.sidebarAction)

}
</script>

<template>
  <div class="c-block">
    <h1> url </h1>
    <span>cur tab url: <span class="text-blue-500 underline">{{ curTabUrl }}</span></span>
    <Button @click="updateCurTabUrl">refresh</Button>
    <div> isHousePage: {{ isHousePage(curTabUrl) }}</div>
    <div> isSoldHousePage: {{ isHouseSoldPage(curTabUrl) }}</div>
    <div> isCaptchaPage: {{ isCaptchaPage(curTabUrl) }}</div>
  </div>
  <div class="c-block">
    <h1>fetch</h1>
    <Input v-model="url" placeholder="Enter url"/>
    <Button @click="testFetch">testFetch</Button>
  </div>

  <div class="c-block">
    <h1>tsx</h1>
    <Foo msg="hello"/>
    <SimpleTsx/>
    <StyleTsx/>

  </div>

  <div class="c-block">
    <h1>side panel</h1>
    <div class="flex flex-row gap-4 flex-wrap">
      <Button @click="logBrowserSidePanelRelated">log browser sidepanel obj</Button>
      <Button @click="openSidePanel">open side panel specific page</Button>

    </div>
  </div>

</template>

<style scoped>

</style>