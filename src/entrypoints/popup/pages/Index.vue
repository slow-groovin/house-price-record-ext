<script setup lang="ts">


import { Button } from "@/components/ui/button";
import { sendMessage } from "@@/messaging";
import { TaskGroup } from "@/types/group";
import { onMounted, ref, toRaw } from 'vue'
import { db } from "@/entrypoints/db/Dexie";
import { browser } from "wxt/browser";
import { Icon } from "@iconify/vue";
import SimpleTabsContainer from "@/components/layout/SimpleTabsContainer.vue";
import { useLocalStorage } from "@vueuse/core";
async function openOptionHomePage() {
  return sendMessage('openOptionPage', '/options.html#/')

}

async function openStartUpPage() {
  return sendMessage('openOptionPage', '/options.html#/startup')
}

const extname = import.meta.env.VITE_EXT_NAME

const cGroups = ref<TaskGroup[]>([])
const hGroups = ref<TaskGroup[]>([])

const defaultTabIndex = useLocalStorage('option-tab-index', 0)

async function queryGroups() {
  cGroups.value = await db.communityTaskGroups.toArray()
  hGroups.value = await db.houseTaskGroups.toArray()
}

async function goBeginCommunityGroupTasks(index: number) {
  const cidList = toRaw(cGroups.value[index].idList)
  const communityList = await db.communityTasks.where('cid').anyOf(cidList).toArray()
  const id = await db.tempBatchCommunity.add({ communityList: communityList })
  const newWindow = await browser.windows.create({ state: 'maximized' })
  await chrome.sidePanel.open({ windowId: newWindow.id as number })
  await chrome.sidePanel.setOptions({ path: '/sidepanel.html#/c/batch?id=' + id })
  db.communityTaskGroups.update(cGroups.value[index].id, {
    lastRunningAt: Date.now()
  })
}


async function goBeginHouseGroupTasks(index: number) {
  const hidList = toRaw(hGroups.value[index].idList)
  const id = await db.tempBatchHouse.add({ hidList })

  const newWindow = await browser.windows.create({ state: 'maximized' })
  await chrome.sidePanel.open({ windowId: newWindow.id as number })
  await chrome.sidePanel.setOptions({ path: '/sidepanel.html#/h/batch?id=' + id })
  db.houseTaskGroups.update(hGroups.value[index].id, {
    lastRunningAt: Date.now()
  })
}

onMounted(() => {
  queryGroups()
})
</script>

<template>

  <div class="p-2 text-nowrap">
    <h1 class="flex items-center justify-center mb-2 mt-2">
      <span class="text-base mx-4">欢迎使用</span>
      <span class="text-primary">{{ extname }}</span>
      <img src="/icon/24.png" alt="icon" class="inline">
    </h1>

    <div class="border rounded p-2 my-4 max-h-screen w-fit min-w-64">
      <SimpleTabsContainer :initial-tab="defaultTabIndex" @tab-change="(t) => defaultTabIndex = t"
        :tabs="[{ name: 'default', label: '首页' }, { name: 'group', label: '运行分组' }]">
        <template #default>
          <div class="flex flex-col gap-2">
            <Button @click="openOptionHomePage">打开后台页面</Button>
            <Button @click="openStartUpPage" class="" variant="outline">查看使用说明</Button>
          </div>
        </template>
        <template #group>
          <div class="w-fit">
            <h2 class="text-xl font-bold text-neutral-500">🟢一键运行任务分组:</h2>
            <div v-if="cGroups.length" class="mt-8">
              <h3 class="font-bold text-neutral-500">(小区)任务组:</h3>
              <div class="flex flex-wrap gap-2">
                <template v-for="(cGroup, index) in cGroups" :key="index">
                  <Button @click="goBeginCommunityGroupTasks(index)" :disabled="cGroup.idList.length === 0"
                    variant="outline" class="border-2 border-green-500">
                    <Icon icon="solar:play-bold" class="w-4 h-4" />
                    {{ cGroup.name }} ({{ cGroup.idList.length }}个)
                  </Button>
                </template>
              </div>
            </div>

            <div v-if="hGroups.length" class="mt-8">
              <h3 class="font-bold text-neutral-500">(房源)任务组:</h3>
              <div class="flex flex-wrap gap-2">
                <template v-for="(hGroup, index) in hGroups">
                  <Button @click="goBeginHouseGroupTasks(index)" :disabled="hGroup.idList.length === 0"
                    variant="outline" class="border-2 border-green-500">
                    <Icon icon="solar:play-bold" class="w-4 h-4" />
                    {{ hGroup.name }} ({{ hGroup.idList.length }}个)
                  </Button>
                </template>
              </div>
            </div>
          </div>
        </template>
      </SimpleTabsContainer>
    </div>

  </div>
</template>

<style scoped></style>