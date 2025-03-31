<script setup lang="ts">
import { useRoute } from "vue-router";
import { TaskGroup } from "@/types/group";
import { db } from "@/entrypoints/db/Dexie";
import { onMounted, ref, toRaw } from "vue";
import { Icon } from "@iconify/vue";
import { formatDistanceToNowHoursOrDays } from "@/utils/date";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";
import { toast } from "vue-sonner";
import { CommunityDetailUrl } from "@/utils/url-component";
import { HouseTaskStatusText } from "@/types/lj";

const { query: { id }, path } = useRoute()

const groupId = Number(id)
const data = ref<TaskGroup>()
const loading = ref(true)
const groupType = path.includes('c/group/detail') ? 'community' : 'house'
const groupTypeZh = groupType === 'community' ? '小区' : '房源'
const groupTypePrefix = groupType === 'community' ? 'c' : 'h'
const dbCollection = () => groupType === 'community' ? db.communityTaskGroups : db.houseTaskGroups

const relatedData = ref<Record<string, any>>({})



async function queryGroupData() {
  if (groupId) {
    data.value = await dbCollection().get(groupId)
    loading.value = false
  }
}

function queryRelatedData() {
  if (groupType === 'house') queryHouseRelatedData()
  else queryCommunityRelatedData()
}
async function queryHouseRelatedData() {
  const hid = data.value?.idList ?? []
  const hList = await db.houseTasks.where('hid').anyOf(hid).toArray()
  for (let h of hList) {
    relatedData.value[h.hid] = {
      '状态': HouseTaskStatusText[h.status],
      '总价': h.totalPrice + '万',
      '面积': h.area + '㎡',
      '名字': h.name,
    }
  }

}

async function queryCommunityRelatedData() {
  const cidList = data.value?.idList ?? []
  const cList = await db.communityTasks.where('cid').anyOf(cidList).toArray()
  for (let c of cList) {
    relatedData.value[c.cid] = {
      '在售数量': c.onSellCount + '套',
      '平均总价': c.avgTotalPrice + '万',
      '名字': c.name,

    }
  }
}

async function deleteIdInList(id: string) {

  data.value = await dbCollection().get(groupId)
  if (!data.value || !data.value.idList) {
    return
  }
  data.value.idList = data.value?.idList.filter(i => i !== id) ?? []
  await dbCollection().update(groupId, {
    idList: toRaw(data.value.idList),
  })
  toast.success('删除成功')
}

onMounted(() => {
  queryGroupData().then(() => {
    queryRelatedData()
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
      <Icon icon="mdi:format-list-group" />
      {{ groupTypeZh }}任务组详情
      <span class="ml-8 text-green-500">{{ data.name }}</span>
    </h1>

    <a :href="`#/${groupTypePrefix}/task/list?groupId=${data.id}&name=${data.name}`" class="link"
      target="_blank">去列表查看详情</a>
    <table>
      <tbody>
        <tr>
          <td>创建时间:</td>
          <td>
            <div class="flex text-xs text-neutral-600 gap-2">
              <div class=" text-blue-400">({{ formatDistanceToNowHoursOrDays(data?.createdAt) }})</div>
              <div>{{ new Date(data?.createdAt as number).toLocaleString() }}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td>上次运行时间:</td>
          <td>
            <div class="flex text-xs text-neutral-600 gap-2">
              <div class=" text-green-400">({{ formatDistanceToNowHoursOrDays(data?.lastRunningAt) }})</div>
              <div>{{ new Date(data?.lastRunningAt as number).toLocaleString() }}</div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="rounded border p-2 my-2">
      <h2 class="font-bold italic border-b">任务列表</h2>
      <div v-if="data.idList" class="flex flex-col flex-nowrap gap-4">
        <TransitionGroup name="list">
          <template v-for="(id, index) in data.idList" :key="id">
            <div class="flex flex-nowrap items-center gap-2">
              <ConfirmDialog @confirm="deleteIdInList(id)">
                <template #trigger>
                  <td>
                    <Icon icon="material-symbols:delete"
                      class="my-auto w-6 h-6 text-red-400 border rounded hover:outline outline-neutral-300 cursor-pointer" />
                  </td>
                </template>
                <span class="text-red-400 font-bold"> 确认要删除这个ID吗? </span>
              </ConfirmDialog>
              <Component :is="CommunityDetailUrl(id)" />
              <div v-for="(v, k, index) in relatedData[id]">
                <span class="font-bold">{{ k }}:</span>{{ v }}
              </div>

            </div>

          </template>
        </TransitionGroup>

      </div>


    </div>

  </div>


</template>

<style scoped></style>