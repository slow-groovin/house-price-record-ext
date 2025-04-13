<script setup lang="ts">

import SimpleTabsContainer from "@/components/layout/SimpleTabsContainer.vue";
import TabsManage from "@/components/debug/TabsManage.vue";
import DexieIndexedDB from "@/components/debug/DexieIndexedDB.vue";
import UnovisSamples from "@/components/debug/UnovisSamples.vue";
import WxtStorage from "@/components/debug/WxtStorage.vue";
import CalendarGraphSample from "@/components/debug/CalendarGraphSample.vue";
import CommunityDebug from "@/components/debug/CommunityDebug.vue";
import TanstackTable from "@/components/debug/TanstackTable.vue";
import { useLocalStorage, useTitle } from "@vueuse/core";
import UncategorizedDebugFunctions from "@/components/debug/UncategorizedDebugFunctions.vue";
import NetRuleTest from "@/components/debug/NetRuleTest.vue";
import VueSonnerToast from "@/components/debug/VueSonnerToast.vue";
import MessageTest from "@/components/debug/MessageTest.vue";
import DialogSample from "@/components/debug/DialogSample.vue";
import SqliteWasm3rd from "./SqliteWasm3rd.vue";
import RentDataTest from "./RentDataTest.vue";

/**
 * 非数据, 不用background的storage, 仅用页面的localStorage即可
 */
const debugEntryIndex = useLocalStorage('debugEntryIndex', 0)
const handleTabChange = (index: number) => {
  console.log('Active tab changed to:', index)
  debugEntryIndex.value = index
  title.value = components[index].__name
}

function queryTab() {// 获取当前活动的标签页信息
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { console.log("当前标签页信息：", tabs[0]); });
}

const title = useTitle()

const components = [UncategorizedDebugFunctions, TabsManage, NetRuleTest, DexieIndexedDB, UnovisSamples, WxtStorage,
  CalendarGraphSample, CommunityDebug, TanstackTable, DialogSample,
  VueSonnerToast, MessageTest, SqliteWasm3rd, RentDataTest,
]
</script>


<template>
  <div class="flex flex-row flex-wrap p-3 gap-4 bg-red-100 border" id="debug-button-group">
    <button @click="queryTab">queryTab</button>
    <div class="flex flex-row border">
      <label for="block-rules">block-rules</label>
    </div>
  </div>
  <SimpleTabsContainer :tabs="components.map(t => ({ name: t.__name ?? '', label: t.__name ?? '' }))"
    class="p-4 bg-gray-100" :initial-tab="debugEntryIndex" @tabChange="handleTabChange">
    <template v-for="(t) in components" v-slot:[t.__name]>
      <component :is="t" />
    </template>
  </SimpleTabsContainer>
</template>

<style scoped></style>