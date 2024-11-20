<script setup lang="ts">


import {Switch} from "@/components/ui/switch";
import TabsCreate from "@/components/debug/tabs-create.vue";
import DexieIndexedDB from "@/components/debug/DexieIndexedDB.vue";
import {Button} from "@/components/ui/button";
import {db} from "@/utils/client/Dexie";
import TabActiveInfo = chrome.tabs.TabActiveInfo;
import TabChangeInfo = chrome.tabs.TabChangeInfo;
import Tab = chrome.tabs.Tab;
import {isHousePage} from "@/utils/lj-url";
import TaskCreate from "@/components/lj/house/HouseTaskCreate.vue";
import UnovisSamples from "@/components/debug/UnovisSamples.vue";
import DebugEntryTabs from "@/components/debug/DebugEntryTabs.vue";


function queryTab(){
  // 获取当前活动的标签页信息
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const currentTab = tabs[0];
      console.log("当前标签页信息：", currentTab);
      tabId.value=currentTab.id
      isHousePageFlag.value=isHousePage(currentTab.url)

      // 使用 currentTab 的信息
    } else {
      console.log("无法获取当前标签页信息");
    }
  });
}

let listenActiveTab = async (event:TabActiveInfo) => {
  // console.log(tab.url,activeInfo.status,activeInfo,tab.status)
  // await db.debugInfo.add({ msg:'active:'+event.tabId,at:new Date().toLocaleString()})
  // tabId.value=event.tabId
  queryTab()
  // browser.tabs.get(event.tabId, (tab)=>{
  //   isHousePageFlag.value=isHousePage(tab.url)
  // })
  // console.log("当前active的标签页：", event.tabId);
};


let listenCreateTab = async (tab:Tab) => {
  // console.log(tab.url,activeInfo.status,activeInfo,tab.status)
  // await db.debugInfo.add({ msg:'active:'+event.tabId,at:new Date().toLocaleString()})
  tabId.value=tab.id
  isHousePageFlag.value=isHousePage(tab.url)

  console.log("当前active的标签页：", tab.id);
};

let listenUpdateTab = async (_:number,activeInfo:TabChangeInfo,tab:Tab) => {
  // console.log(tab.url,activeInfo.status,activeInfo,tab.status)
  if(activeInfo.status!=='complete' ) return
  isHousePageFlag.value=isHousePage(tab.url)
  tabId.value=tab.id
  // await db.debugInfo.add({ msg:'update:'+tab.url,at:new Date().toLocaleString()})
  console.log("当前update的标签页：", tab.url);
};


// 监听激活的标签页变化

browser.tabs.onCreated.addListener(listenCreateTab)
browser.tabs.onUpdated.addListener(listenUpdateTab);
browser.tabs.onActivated.addListener(listenActiveTab);
onUnmounted(()=>{//取消监听
  console.log('unmounted')
  browser.tabs.onCreated.removeListener(listenCreateTab)
  browser.tabs.onActivated.removeListener(listenActiveTab);
  browser.tabs.onUpdated.removeListener(listenUpdateTab)
})


const isHousePageFlag=ref(false)
const tabId=ref<number|undefined>(0)
onMounted(()=>{
  queryTab()
})
</script>

<template>

  <div class="c-block">
    <h1>SidePanel</h1>
    <div>
      <Button @click="queryTab">queryTab</Button>
    </div>
    {{tabId}}
    <div v-if="isHousePageFlag">
      <TaskCreate v-if="tabId" :tab-id="tabId"/>
      isHousePage: {{isHousePageFlag}}
    </div>
  </div>


  <DebugEntryTabs/>



</template>

<style>

</style>