<script setup lang="ts">
import { useRoute } from "vue-router";
import { db } from "@/entrypoints/db/Dexie";
import { CommonFieldChange, CommunityTask, HouseChange, HouseStatusChange, HouseTask, HouseTaskStatus } from "@/types/lj";
import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import { AccessRecord } from "@/utils/lib/AcessRecord";
import { Button } from "@/components/ui/button";
import { oneHouseEntry } from "@/entrypoints/reuse/house-control2";
import { onMounted, ref } from "vue";
import { genCommunityPageUrl, genHousePageUrl, genKeRentHousePageUrl } from "@/utils/lj-url";
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
import { RentCommunityTask, RentHouse, RentHousePriceChange, RentHouseStatusChange } from "@/types/rent";
import { KeRentDao } from "@/entrypoints/db/rent-dao";

const { query } = useRoute()
const rid = query['id'] as string

const task = ref<RentHouse>()
const changes = ref<RentHousePriceChange[]>()
const statusChanges = ref<RentHouseStatusChange[]>()
const communityTask = ref<RentCommunityTask>()

useExtTitle(() => '🏠任务详情')

async function queryData() {
  task.value = await KeRentDao().findHouseByRid(rid)
  changes.value = await KeRentDao().findChangesByRidsAndType([rid], 'price')
  statusChanges.value = await KeRentDao().findChangesByRidsAndType([rid], 'status')
  communityTask.value = await KeRentDao().findFirstCommunityByCid(task.value.cid)
}

onMounted(() => {
  queryData()
})


</script>

<template>

  <template v-if="!task">
    <DataEmptyState class="mt-64 mb-5" />
    <div class="text-center text-xl text-black">🏠任务 [{{ rid }}] 不存在</div>
  </template>
  <template v-else>
    <div :class="cn('flex flex-row flex-wrap items-center gap-x-7')">
      <h1 class="text-2xl font-bold text-primary">
        🏠[{{ task.rid }}] {{ task.name }}
      </h1>

      <div v-if="task.status === HouseTaskStatus.running"
        class=" px-2 py-1 ml-[-1em] font-bold text-sm  text-green-600/60 border rounded-full shadow ">
        ● Running
      </div>
      <div v-else-if="task.status === HouseTaskStatus.miss"
        class=" px-2 py-1 ml-[-1em] font-bold text-sm  bg-neutral-500/60 text-white border rounded-full shadow ">
        ● 下架
      </div>


      <a class="link flex self-end text-sm" :href="genKeRentHousePageUrl(communityTask?.city!, task?.rid)"
        target="_blank">
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

    </div>

    <Separator class="h-1 my-8 bg-gray-50" />


    <div class="flex flex-row flex-wrap gap-4 ">

      <InfoItemCard name="城市" :value="communityTask?.city" icon="noto:cityscape" />
      <InfoItemCard name="小区">
        <a class="hover-link text-xl" target="_blank" :href="`/options.html#/rent/c/task/detail?id=${task.cid}`">{{
          communityTask?.name }}</a>
      </InfoItemCard>
      <InfoItemCard name="任务创建时间" :value="new Date(task?.createdAt).toLocaleString()" type="date" />
      <div class="grow basis-full" />
      <InfoItemCard name="价格" :value="task?.price" type="money" postfix="元/月" />
      <InfoItemCard name="单价" v-if="task?.area" :value="(task?.price / task.area).toFixed(0)" type="money"
        postfix="元/月/㎡" />
      <InfoItemCard name="单价Ⅱ" v-if="task?.area" :value="(task?.price / 30).toFixed(0)" type="money" postfix="元/天" />

      <InfoItemCard name="面积" :value="task?.area" type="area" postfix="㎡" />


      <InfoItemCard name="介绍信息" :value="task?.desc" />
      <InfoItemCard v-if="task.createdAt" name="添加时间" :value="new Date(task?.createdAt).toLocaleDateString()"
        type="date" />
      <InfoItemCard v-if="task.releasedAt && task.releasedAt !== task.createdAt" name="上架时间"
        :value="new Date(task?.releasedAt).toLocaleDateString()" type="date" />


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

    <div class="my-8">
      <h2> 状态变更</h2>
      <div>
        <div v-for="change in statusChanges" class="flex flex-row gap-3 items-center">
          <TwoLineAt :at="change.at" />
          <StatusChangeBudget :old-value="change.oldValue" :new-value="change.newValue" />
        </div>
      </div>
    </div>



  </template>


</template>

<style scoped></style>