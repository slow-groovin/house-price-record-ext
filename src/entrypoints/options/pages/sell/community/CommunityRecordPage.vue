<script setup lang="ts">
import { useRoute } from "vue-router";
import { CommunityRecord } from "@/types/lj";
import { computed, onMounted, ref } from "vue";
import { db } from "@/entrypoints/db/Dexie";
import { HouseDetailUrl } from "@/utils/url-component";
import DataEmptyState from "@/components/DataEmptyState.vue";
import TwoLineAt from "@/components/lj/column/TwoLineAt.vue";
import TotalPriceItem from "@/entrypoints/options/components/TotalPriceItem.vue";
import NewPriceChangeBudget from "@/components/lj/house/NewPriceChangeBudget.vue";
import { Button } from '@/components/ui/button'
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";
import { toast } from "vue-sonner";
import { useExtTitle } from '@/composables/useExtInfo'

const { query } = useRoute()
const id = Number.parseInt(query['id'] as string)
useExtTitle('记录详情' + id)

const detailData = ref<CommunityRecord>()

async function queryData() {
  detailData.value = await db.communityRecords.get(id)
}

const normalItems = computed(() => {
  console.log(detailData.value)
  return detailData.value?.houseList.filter(item => {
    return !(detailData.value?.priceUpList?.some(i => i.hid === item.hid) || detailData.value?.priceDownList?.some(i => i.hid === item.hid)
      || detailData.value?.addedItem?.some(i => i.hid === item.hid) || detailData.value?.removedItem?.some(i => i.hid === item.hid))
  })
})

async function deleteRecord() {
  await db.communityRecords.delete(id)
  toast.success('删除成功! 3s后关闭页面.')
  setTimeout(() => {
    window.location.reload()
  }, 3000)
}
onMounted(() => {
  queryData()
})
</script>

<template>
  <div v-if="!detailData">
    <DataEmptyState class="mt-64 mb-5" />
    <div class="text-center text-xl text-black">记录ID: {{ id }}</div>

  </div>
  <div v-else>
    <h1 class="text-2xl font-bold">
      小区任务运行记录
      [<span class="text-green-500">{{ id }}</span>]
    </h1>

    <div class="flex gap-4">
      <TwoLineAt :at="detailData.at" />
    </div>

    <div class="flex w-full justify-end">

      <ConfirmDialog @confirm="deleteRecord()">
        <template #trigger>
          <Button variant="destructive">删除</Button>
        </template>
        <template #default>
          删除删除这条记录吗?(删除后无法恢复, 无法手动添加, 请在完全确认的情况下确认删除)
        </template>
      </ConfirmDialog>

    </div>


    <table class="">
      <tbody>
        <tr>
          <th>平均总价</th>
          <th class="text-green-500 font-bold italic">{{ detailData.avgTotalPrice }}万元</th>
        </tr>
        <tr>
          <th>平均单价</th>
          <th class="text-green-500  ">{{ detailData.avgUnitPrice }} 元/㎡</th>
        </tr>

        <tr>
          <th>在售数量</th>
          <th class="">{{ detailData.onSellCount }}</th>
        </tr>
        <tr>
          <th>降价数量📉</th>
          <th class="">{{ detailData.priceDownList?.length }}</th>
        </tr>
        <tr>
          <th>涨价数量📈</th>
          <th class="">{{ detailData.priceUpList?.length }}</th>
        </tr>
        <tr>
          <th>新上架数量🆕</th>
          <th class="">{{ detailData.addedItem?.length }}</th>
        </tr>
        <tr>
          <th class="line-through">下架数量🛒</th>
          <th class="">{{ detailData.removedItem?.length }}</th>
        </tr>
        <tr>
          <th>未变化数量</th>
          <th class="">{{
            (detailData.onSellCount ?? 0) - (detailData?.priceDownList?.length ?? 0) - (detailData?.priceUpList?.length
              ??
              0)
            - (detailData?.addedItem?.length ?? 0) - (detailData?.removedItem?.length ?? 0)
          }}
          </th>
        </tr>
        <tr>
          <th>过去90天访问量</th>
          <th class="">{{ detailData.visitCountIn90Days }}</th>
        </tr>
        <tr>
          <th>过去90天成交量</th>
          <th class="">{{ detailData.doneCountIn90Days }}</th>
        </tr>
      </tbody>
    </table>


    <h2 class="my-4 border-b font-bold text-2xl">房源详情</h2>
    <div class="flex flex-col gap-2 ">
      <template v-for="item in detailData.removedItem">
        <div class="flex flex-row gap-4 border bg-neutral-100">
          <div class="min-w-20 text-sm">下架或成交</div>
          <div class="line-through italic decoration-red-500">
            <Component :is="HouseDetailUrl(item.hid)" />
          </div>
          <TotalPriceItem :price="item.price" :id="item.hid" />
        </div>
      </template>
      <template v-for="item in detailData.addedItem">
        <div class="flex flex-row gap-4 border bg-blue-100">
          <div class="min-w-20">🆕新上架</div>
          <Component :is="HouseDetailUrl(item.hid)" />
          <TotalPriceItem :price="item.price" :id="item.hid" />
        </div>
      </template>

      <template v-for="item in detailData.priceDownList">
        <div class="flex flex-row items-center gap-4 border bg-green-100">
          <div class="min-w-20">📉降价</div>
          <Component :is="HouseDetailUrl(item.hid)" />
          <NewPriceChangeBudget :new-value="item.price" :old-value="item.oldPrice" unit="万" />

        </div>
      </template>

      <template v-for="item in detailData.priceUpList">
        <div class="flex flex-row items-center gap-4 border bg-red-100">
          <div class="min-w-20">📈涨价</div>
          <Component :is="HouseDetailUrl(item.hid)" />
          <NewPriceChangeBudget :new-value="item.price" :old-value="item.oldPrice" unit="万" />

        </div>
      </template>

      <template v-for="item in normalItems">
        <div class="flex flex-row flex-nowrap gap-4 border">
          <div class="min-w-20">
          </div>
          <Component :is="HouseDetailUrl(item.hid)" />
          <TotalPriceItem :price="item.price" :id="item.hid" />
        </div>

      </template>

    </div>


  </div>

</template>

<style scoped lang="postcss">
h1 {
  @apply text-2xl text-center
}

table, th, tr {
  border: 1px black solid;
  text-align: left;
}
</style>