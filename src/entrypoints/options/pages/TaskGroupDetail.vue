<script setup lang="ts">
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";
import TwoLineAt from "@/components/lj/column/TwoLineAt.vue";
import { db } from "@/entrypoints/db/Dexie";
import { GroupIdType, TaskGroup2 } from "@/types/group";
import { CommunityDetailUrl, HouseDetailUrl, RentCommunityDetailUrl } from "@/utils/url-component";
import { Icon } from "@iconify/vue";
import { onMounted, ref, toRaw } from "vue";
import { useRoute } from "vue-router";
import { toast } from "vue-sonner";

const { query: { id }, path } = useRoute()

const groupId = Number(id)
const data = ref<TaskGroup2>()
const loading = ref(true)

const relatedData = ref<Record<string, any>>({})



async function queryGroupData() {
  if (groupId) {
    data.value = await db.taskGroups.get(groupId)
    loading.value = false
  }
}


async function deleteIdInList(id: string, type: GroupIdType) {
  await queryGroupData()
  if (!data.value) {
    toast.error('data not exist')
    throw new Error('data not exist ' + id)
  }
  if (type === 'ljSellCid') {
    data.value.ljSellCidList = data.value.ljSellCidList.filter(i => i !== id)
  } else if (type === 'ljSellHid') {
    data.value.ljSellHidList = data.value.ljSellHidList.filter(i => i !== id)
  } else if (type === 'keRentCid') {
    data.value.keRentCidList = data.value.keRentCidList.filter(i => i !== id)
  }

  await db.taskGroups.update(groupId, {
    // idList: toRaw(data.value.idList),
    ljSellCidList: toRaw(data.value.ljSellCidList),
    ljSellHidList: toRaw(data.value.ljSellHidList),
    keRentCidList: toRaw(data.value.keRentCidList),
  })
  toast.success('删除成功')
}

onMounted(() => {
  queryGroupData().then(() => {
  })
})
</script>

<template>
  <div v-if="!data" class="relative w-96 h-96">
    <LoadingOverlay v-if="loading" />
    <div v-else class="font-bold text-3xl">
      分组 {{ id }} 不存在.
    </div>
  </div>
  <div v-else>
    <h1 class="font-bold my-4 mx-2 text-2xl flex items-center">
      📦任务组详情
      <span class="ml-8 text-green-500">{{ data.name }}</span>
    </h1>



    <div class="grid grid-cols-2 gap-4 text-sm w-fit">
      <div class="font-bold">创建时间:</div>
      <div>
        <TwoLineAt :at="data?.createdAt" />
      </div>
      <div class="font-bold">上次运行时间:</div>
      <div>
        <TwoLineAt :at="data?.lastRunningAt" />
      </div>
    </div>

    <div class="rounded border p-2 my-2 w-fit" v-if="data.ljSellCidList.length">
      <h2 class="font-bold italic border-b">
        (lianjia)二手房小区任务
        <a :href="`#/c/task/list?groupId=${data.id}&name=${data.name}`" class="link" target="_blank">列表页查看</a>
      </h2>
      <div class="flex flex-col flex-nowrap gap-4">
        <TransitionGroup name="list">
          <template v-for="(id, index) in data.ljSellCidList" :key="id">
            <div class="flex flex-nowrap items-center gap-2">
              <ConfirmDialog @confirm="deleteIdInList(id, 'ljSellCid')">
                <template #trigger>
                  <td>
                    <Icon icon="material-symbols:delete"
                      class="my-auto w-6 h-6 text-red-400 border rounded hover:outline outline-neutral-300 cursor-pointer" />
                  </td>
                </template>
                <span class="text-red-400 font-bold"> 确认要删除这个ID吗? </span>
              </ConfirmDialog>
              <Component :is="CommunityDetailUrl(id)" />
            </div>
          </template>
        </TransitionGroup>

      </div>
    </div>


    <div class="rounded border p-2 my-2 w-fit" v-if="data.ljSellHidList.length">
      <h2 class="font-bold italic border-b">
        (lianjia)二手房房源任务
        <a :href="`#/h/task/list?groupId=${data.id}&name=${data.name}`" class="link" target="_blank">列表页查看</a>
      </h2>
      <div class="flex flex-col flex-nowrap gap-4">
        <TransitionGroup name="list">
          <template v-for="(id, index) in data.ljSellHidList" :key="id">
            <div class="flex flex-nowrap items-center gap-2">
              <ConfirmDialog @confirm="deleteIdInList(id, 'ljSellHid')">
                <template #trigger>
                  <td>
                    <Icon icon="material-symbols:delete"
                      class="my-auto w-6 h-6 text-red-400 border rounded hover:outline outline-neutral-300 cursor-pointer" />
                  </td>
                </template>
                <span class="text-red-400 font-bold"> 确认要删除这个ID吗? </span>
              </ConfirmDialog>
              <Component :is="HouseDetailUrl(id)" />
            </div>
          </template>
        </TransitionGroup>

      </div>
    </div>

    <div class="rounded border p-2 my-2 w-fit" v-if="data.keRentCidList.length">
      <h2 class="font-bold italic border-b">
        (ke)租房小区任务
        <a :href="`#/rent/c/task/list?_groupId=${data.id}&name=${data.name}`" class="link" target="_blank">列表页查看</a>
      </h2>
      <div class="flex flex-col flex-nowrap gap-4">
        <TransitionGroup name="list">
          <template v-for="(id, index) in data.keRentCidList" :key="id">
            <div class="flex flex-nowrap items-center gap-2">
              <ConfirmDialog @confirm="deleteIdInList(id, 'keRentCid')">
                <template #trigger>
                  <td>
                    <Icon icon="material-symbols:delete"
                      class="my-auto w-6 h-6 text-red-400 border rounded hover:outline outline-neutral-300 cursor-pointer" />
                  </td>
                </template>
                <span class="text-red-400 font-bold"> 确认要删除这个ID吗? </span>
              </ConfirmDialog>
              <Component :is="RentCommunityDetailUrl(id)" />
            </div>
          </template>
        </TransitionGroup>

      </div>
    </div>
  </div>


</template>

<style scoped></style>