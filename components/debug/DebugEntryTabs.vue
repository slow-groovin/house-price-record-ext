<script setup lang="ts">

import SimpleTabsContainer from "@/components/layout/SimpleTabsContainer.vue";
import TabsCreate from "@/components/debug/tabs-create.vue";
import DexieIndexedDB from "@/components/debug/DexieIndexedDB.vue";
import UnovisSamples from "@/components/debug/UnovisSamples.vue";
import WxtStorage from "@/components/debug/WxtStorage.vue";
import CalendarGraphSample from "@/components/debug/CalendarGraphSample.vue";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {allBlockRuleKeys, updateRules} from "@/utils/block";
import CommunityDebug from "@/components/debug/CommunityDebug.vue";
import FakeDataInsert from "@/components/debug/FakeDataInsert.vue";

/**
 * 非数据, 不用background的storage, 仅用页面的localStorage即可
 */
const debugEntryIndex = useLocalStorage('debugEntryIndex', 0)
const handleTabChange = (index: number) => {
  console.log('Active tab changed to:', index)
  debugEntryIndex.value = index

}

function queryTab(){// 获取当前活动的标签页信息
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {    console.log("当前标签页信息：", tabs[0]);  });
}
function toggleRules(payload:boolean){
  if(payload){
    allBlockRuleKeys.forEach(k=>updateRules(k))
  }else{
    allBlockRuleKeys.forEach(k=>removeRules(k))
  }
}


const components = [TabsCreate, DexieIndexedDB, UnovisSamples, WxtStorage,CalendarGraphSample,CommunityDebug,FakeDataInsert]
</script>


<template>
  <div class="flex flex-row flex-wrap p-3 gap-4 bg-red-100 border" id="debug-button-group">
    <button @click="queryTab">queryTab</button>
    <div class="flex flex-row border">
      <label for="block-rules">block-rules</label>
      <Switch id="block-rules" @update:checked="toggleRules" />  
    </div>
  </div>
  <SimpleTabsContainer
      :tabs="components.map(t=>({name:t.__name??'',label:t.__name??''}))"
      class="p-4 bg-gray-100"
      :initial-tab="debugEntryIndex"
      @tabChange="handleTabChange"
  >
    <template v-for="(t) in components" v-slot:[t.__name]>
      <component :is="t"/>
    </template>
  </SimpleTabsContainer>
</template>

<style scoped>

</style>