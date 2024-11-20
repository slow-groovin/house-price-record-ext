<script setup lang="ts">

import SimpleTabsContainer from "@/components/layout/SimpleTabsContainer.vue";
import TabsCreate from "@/components/debug/tabs-create.vue";
import DexieIndexedDB from "@/components/debug/DexieIndexedDB.vue";
import UnovisSamples from "@/components/debug/UnovisSamples.vue";
import WxtStorage from "@/components/debug/WxtStorage.vue";
import CalendarGraphSample from "@/components/debug/CalendarGraphSample.vue";

/**
 * 非数据, 不用background的storage, 仅用页面的localStorage即可
 */
// const firstDebugEntryIndexReady = ref(false)
// const {state: debugEntryIndex, isReady, isLoading} = useWxtStorage('local:debugEntryIndex', 0,
//     {
//       immediate: true,
//       onSuccess: (d) => {
//         firstDebugEntryIndexReady.value = true
//       }
//     })

const debugEntryIndex = useLocalStorage('debugEntryIndex', 0)
const handleTabChange = (index: number) => {
  console.log('Active tab changed to:', index)
  debugEntryIndex.value = index

}

const components = [TabsCreate, DexieIndexedDB, UnovisSamples, WxtStorage,CalendarGraphSample]
</script>


<template>
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