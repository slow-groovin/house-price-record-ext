<script setup lang="ts">
import { useRoute } from "vue-router";
import { db } from "@/utils/client/Dexie";
import { CommonFieldChange, CommunityTask, HouseChange, HouseStatusChange, HouseTask, HouseTaskStatus } from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import { AccessRecord } from "@/utils/lib/AcessRecord";
import { Button } from "@/components/ui/button";
import { oneHouseEntry } from "@/entrypoints/reuse/house-control2";
import { onMounted, ref } from "vue";
import { genCommunityPageUrl, genHousePageUrl } from "@/utils/lj-url";
import { toast } from "vue-sonner";
import { updateOneMiss, updateOneNormal, updateOneSold } from "@/entrypoints/reuse/house-update";
import { PauseError } from "@/utils/lib/BatchQueueExecutor";
import { useMutation } from "@tanstack/vue-query";
import { HouseNormal, HouseSold } from "@/types/LjUpdatePreview";
import { Icon } from "@iconify/vue";
import { cn } from "@/utils/shadcn-utils";
import DataEmptyState from "@/components/DataEmptyState.vue";
import TwoLineAt from "@/components/lj/column/TwoLineAt.vue";
import { Separator } from "@/components/ui/separator";
import InfoItemCard from "@/components/lj/InfoItemCard.vue";
import AddedTypeBudget from "@/components/lj/house/AddedTypeBudget.vue";
import NewPriceChangeBudget from "@/components/lj/house/NewPriceChangeBudget.vue";
import StatusChangeBudget from "@/components/lj/house/StatusChangeBudget.vue";
import RealAreaDesc from "@/entrypoints/options/components/description/RealAreaDesc.vue";
import { useExtTitle } from "@/composables/useExtInfo";

const { query } = useRoute()
const hid = query['id'] as string

const task = ref<HouseTask>()
const changes = ref<HouseChange[]>()
const statusChanges = ref<HouseStatusChange[]>()
const commonFieldChanges = ref<CommonFieldChange[]>()
const communityTask = ref<CommunityTask>()

useExtTitle(() => '🏠任务详情')

async function queryData() {
  task.value = await db.houseTasks.where('hid').equals(hid).first()
  changes.value = await db.houseChanges.where('hid').equals(hid).toArray()
  statusChanges.value = await db.houseStatusChanges.where('hid').equals(hid).toArray()
  commonFieldChanges.value = await db.houseCommonFieldChanges.where('hid').equals(hid).toArray()
  communityTask.value = await db.communityTasks.where('cid').equals(task.value!.cid).last()
}

async function beginCrawlOne() {
  try {
    const rs = await oneHouseEntry(hid)
    if (!rs) { //不会落入这个分支
      return
    }
    if (rs.type === 'normal') {
      await updateOneNormal(rs as HouseNormal, task.value!, Date.now())
      toast.success('任务更新成功!(状态:在售)')
    } else if (rs.type === 'sold') {
      await updateOneSold(rs as HouseSold, task.value!, Date.now())
      toast.success('任务更新成功!(状态:成交)')
    } else if (rs.type === 'miss') {
      await updateOneMiss(rs, task.value!, Date.now())
      toast.success('任务更新成功!(状态:下架)')
    }
  } catch (e) {
    if (e instanceof PauseError) {
      toast.warning('任务中断:' + e.message, { duration: 10000 })
    } else {
      toast.error('任务失败:' + (e as Error).message, { duration: 10000 })
    }
  }

  await queryData()
}

const { status: beginCrawlStatus, mutate: beginCrawlMutate } = useMutation({
  mutationFn: beginCrawlOne,
})

function task2ObjectTableData(t: HouseTask) {
  return {
    ...t,
    createdAt: new Date(t?.createdAt).toLocaleString(),
    lastRunningAt: new Date(t?.lastRunningAt).toLocaleString()
  }
}

onMounted(() => {
  queryData()
})


</script>

<template>

  <template v-if="!task">
    <DataEmptyState class="mt-64 mb-5" />
    <div class="text-center text-xl text-black">🏠任务 [{{ hid }}] 不存在</div>
  </template>
  <template v-else>
    <div :class="cn('flex flex-row flex-wrap items-center gap-x-7')">
      <h1 class="text-2xl font-bold text-primary">
        🏠[{{ task.hid }}] {{ task.name }}
      </h1>

      <div v-if="task.status === HouseTaskStatus.running"
        class=" px-2 py-1 ml-[-1em] font-bold text-sm  text-green-600/60 border rounded-full shadow ">
        ● Running
      </div>
      <div v-else-if="task.status === HouseTaskStatus.miss"
        class=" px-2 py-1 ml-[-1em] font-bold text-sm  bg-neutral-500/60 text-white border rounded-full shadow ">
        ● 下架
      </div>
      <div v-else-if="task.status === HouseTaskStatus.sold"
        class=" px-2 py-1 ml-[-1em] font-bold text-sm  bg-blue-500 text-white border rounded-full shadow ">
        √ 成交
      </div>

      <a class="link flex self-end text-sm" :href="genHousePageUrl(task?.city, task?.hid)" target="_blank">
        去访问网页
        <Icon icon="tdesign:jump" />
      </a>
    </div>

    <div class="flex flex-row items-center gap-8  ">
      <div class="flex self-end items-center  font-bold  ">
        <span class="text-primary text-sm mr-2">最后运行于:</span>
        <div class="flex  gap-4 text-gray-600">
          <TwoLineAt :at="task.lastRunningAt" class="text-lg" />
        </div>
      </div>
      <div class="grow"></div>
      <Button class="py-0.5 pl-1 [&_svg]:size-6 gap-x-0 bg-green-600" size="sm" :disable="beginCrawlStatus !== 'pending'"
        @click="beginCrawlMutate()">

        <Icon icon="solar:refresh-circle-linear" class="h-8 w-8" width="20px" height="20px" />
        <div class="text-base">运行任务</div>
      </Button>
    </div>

    <Separator class="h-1 my-8 bg-gray-50" />


    <div class="flex flex-row flex-wrap gap-4 ">

      <InfoItemCard name="城市" :value="task?.city" icon="noto:cityscape" />
      <InfoItemCard name="小区">
        <div v-if="!communityTask" class="">
          <span class="text-sm italic">(任务尚未创建)</span>
          <a class="link flex-nowrap flex items-center" target="_blank" rel="noreferrer"
            :href="genCommunityPageUrl(task.city, task.cid, 1)">{{ task.cid }}
            <Icon icon="tdesign:jump" />
          </a>
        </div>
        <div v-else>
          <a class="hover-link text-xl" target="_blank"
            :href="`/options.html#/c/task/detail?id=${task.cid}`">{{ communityTask.name }}</a>
        </div>
      </InfoItemCard>
      <InfoItemCard name="任务创建时间" :value="new Date(task?.createdAt).toLocaleString()" type="date" />
      <div class="grow basis-full" />
      <InfoItemCard name="总价" :value="task?.totalPrice" type="money" postfix="万元" />
      <InfoItemCard name="单价" :value="task?.unitPrice" type="money" postfix="元/㎡" />

      <InfoItemCard name="面积" :value="task?.area" type="area" postfix="㎡" />
      <InfoItemCard name="计算面积" :value="task?.realArea" type="area" postfix="㎡">
        <template #hoverDesc>
          <RealAreaDesc />
        </template>
      </InfoItemCard>

      <InfoItemCard name="建筑类型" :value="task?.buildingType" />
      <InfoItemCard name="建造年代" :value="task?.yearBuilt" />
      <InfoItemCard name="房间" :value="task?.roomType" />
      <InfoItemCard name="楼层" :value="task?.roomSubType" />
      <InfoItemCard name="朝向" :value="task?.orientation" />
      <InfoItemCard v-if="task?.onSellDate" name="上架时间" :value="new Date(task?.onSellDate).toLocaleDateString()"
        type="date" />
      <InfoItemCard v-if="task?.soldDate" class="bg-blue-200" name="成交时间" :value="task?.soldDate" type="date" />

      <InfoItemCard name="添加类型" desc="手动创建的还是自动创建的">
        <AddedTypeBudget :added-type="task?.addedType" />
      </InfoItemCard>
    </div>



    <div class="my-8">
      <h2> 价格变化 </h2>
      <div>
        <div v-for="change in changes" class="flex flex-row gap-3 items-center">
          <TwoLineAt :at="change.at" />
          <NewPriceChangeBudget :old-value="change.oldValue" :new-value="change.newValue" />
        </div>
      </div>
      <div v-if="changes?.length === 0">无</div>
    </div>

    <div v-if="commonFieldChanges?.length" class="my-8">
      <h2> 字段文本变更 </h2>
      <div>
        <div v-for="change in commonFieldChanges" class="flex flex-row gap-3">
          <div>{{ new Date(change.at).toLocaleString() }}</div>
          <div> {{ change.name }}</div>
          <div> {{ change.oldValue }}</div>
          <div> →</div>
          <div> {{ change.newValue }}</div>
        </div>
      </div>
    </div>

    <div class="my-8">
      <h2> 状态变更</h2>
      <div>
        <div v-for="change in statusChanges" class="flex flex-row gap-3 items-center">
          <TwoLineAt :at="change.at" />
          <StatusChangeBudget :old-value="change.oldValue" :new-value="change.newValue" />
        </div>
      </div>
    </div>

    <div class="my-8">
      <h2>运行日历</h2>
      <CalendarGraph v-if="task" :access-record="AccessRecord.fromAccessRecord(task?.accessRecord)" />
    </div>


  </template>


</template>

<style scoped>
h2 {
  @apply text-lg font-bold border-b mb-2
}
</style>