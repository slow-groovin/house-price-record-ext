<script setup lang="ts">


import SimpleTabsContainer from "@/components/layout/SimpleTabsContainer.vue";
import { Button } from "@/components/ui/button";
import { db } from "@/entrypoints/db/Dexie";
import GroupRunButton from "@/entrypoints/options/components/GroupRunButton.vue";
import { goRunGroupTask } from "@/entrypoints/reuse/group-control";
import { calcGroupSize, TaskGroup2 } from "@/types/group";
import { sendMessage } from "@@/messaging";
import { Icon } from "@iconify/vue";
import { useLocalStorage } from "@vueuse/core";
import { onMounted, ref, toRaw } from 'vue';
async function openOptionHomePage() {
  return sendMessage('openOptionPage', '/options.html#/')

}

async function openStartUpPage() {
  return sendMessage('openOptionPage', '/options.html#/startup')
}

const extname = import.meta.env.VITE_EXT_NAME

const groups = ref<TaskGroup2[]>([])

const defaultTabIndex = useLocalStorage('option-tab-index', 0)

async function queryGroups() {
  groups.value = await db.taskGroups.toArray()
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
            <h2 class="text-xl font-bold text-neutral-500">📦一键运行任务分组:</h2>
            <div v-if="groups.length" class="mt-8">
              <!-- <h3 class="font-bold text-neutral-500">任务组:</h3> -->
              <div class="flex flex-col gap-2">
                <template v-for="(cGroup, index) in groups" :key="index">
                  <div class="border rounded-lg p-1">
                    <div class="text-primary font-bold">{{ cGroup.name }}:</div>
                    <GroupRunButton :group="toRaw(cGroup)" />
                  </div>
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