<script setup lang="ts">
import {isHousePage} from "@/utils/lj-url";
import HouseTaskPanel from "@/entrypoints/sidepanel/pages/HouseTaskPanel.vue";

import {onMounted, onUnmounted, ref} from "vue";
import {browser, Tabs} from "wxt/browser";
import TabChangeInfo = chrome.tabs.TabChangeInfo;
import {useLocalStorage} from "@vueuse/core";


async function queryTab() {
  // 获取当前活动的标签页信息
  const tabs = await browser.tabs.query({ active: true, currentWindow: true})

  if (tabs.length > 0) {
    const currentTab = tabs[0];
    console.log("当前标签页信息：", currentTab);
    tabId.value = currentTab.id
    isHousePageFlag.value = isHousePage(currentTab.url)

    // 使用 currentTab 的信息
  } else {
    console.log("无法获取当前标签页信息");
  }
}

let listenActiveTab = async (event: any) => {
  // console.log(tab.url,activeInfo.status,activeInfo,tab.status)
  // await db.debugInfo.add({ msg:'active:'+event.tabId,at:new Date().toLocaleString()})
  // tabId.value=event.tabId
  queryTab()
  // browser.tabs.get(event.tabId, (tab)=>{
  //   isHousePageFlag.value=isHousePage(tab.url)
  // })
  // console.log("当前active的标签页：", event.tabId);
};


let listenCreateTab = async (tab: Tabs.Tab) => {
  // console.log(tab.url,activeInfo.status,activeInfo,tab.status)
  // await db.debugInfo.add({ msg:'active:'+event.tabId,at:new Date().toLocaleString()})
  tabId.value = tab.id
  isHousePageFlag.value = isHousePage(tab.url)

  console.log("当前active的标签页：", tab.id);
};

let listenUpdateTab = async (_: number, activeInfo: TabChangeInfo, tab: Tab) => {
  // console.log(tab.url,activeInfo.status,activeInfo,tab.status)
  if (activeInfo.status !== 'complete') return
  isHousePageFlag.value = isHousePage(tab.url)
  tabId.value = tab.id
  // await db.debugInfo.add({ msg:'update:'+tab.url,at:new Date().toLocaleString()})
  console.log("当前update的标签页：", tab.url);
};


// 监听激活的标签页变化

browser.tabs.onCreated.addListener(listenCreateTab)
browser.tabs.onUpdated.addListener(listenUpdateTab);
browser.tabs.onActivated.addListener(listenActiveTab);
onUnmounted(() => {//取消监听
  console.log('unmounted')
  browser.tabs.onCreated.removeListener(listenCreateTab)
  browser.tabs.onActivated.removeListener(listenActiveTab);
  browser.tabs.onUpdated.removeListener(listenUpdateTab)
})


const isHousePageFlag = ref(false)
const defaultOpenDebugPanel=useLocalStorage('side-panel-debug-panel-open',false)
const initialOpenDebugPanel=defaultOpenDebugPanel.value
const tabId = ref<number | undefined>(0)
onMounted(() => {
  queryTab()
})
</script>

<template>

  <div class="c-block">
    <h1>SidePanel {{ tabId }}</h1>

    <div v-if="isHousePageFlag">
      <HouseTaskPanel v-if="tabId" :tab-id="tabId"/>
      isHousePage: {{ isHousePageFlag }}
    </div>
  </div>
  <details  :open="initialOpenDebugPanel"  @toggle="(v)=>{defaultOpenDebugPanel=v.newState==='open'}">
    <summary>debug panel</summary>
    <a href="/sidepanel.html#/debug"/>

  </details>


</template>

<style>

</style>