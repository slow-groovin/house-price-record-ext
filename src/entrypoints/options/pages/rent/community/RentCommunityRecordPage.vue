<script setup lang="ts">
import { useRoute } from "vue-router";
import { RentCommunityRecord } from "@/types/rent";
import { computed, onMounted, ref } from "vue";
import { RentHouseDetailUrl } from "@/utils/url-component";
import DataEmptyState from "@/components/DataEmptyState.vue";
import TwoLineAt from "@/components/lj/column/TwoLineAt.vue";
import TotalPriceItem from "@/entrypoints/options/components/TotalPriceItem.vue";
import NewPriceChangeBudget from "@/components/lj/house/NewPriceChangeBudget.vue";
import { Button } from '@/components/ui/button'
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";
import { toast } from "vue-sonner";
import { useExtTitle } from '@/composables/useExtInfo'
import { KeRentDao } from "@/entrypoints/db/rent-dao";
import { genKeRentHousePageUrl, genOptionKeRentHouseUrl } from "@/utils/lj-url";

const { query } = useRoute()
const id = Number.parseInt(query['id'] as string)
useExtTitle('记录详情' + id)

const detailData = ref<RentCommunityRecord>()

async function queryData() {
  detailData.value = await KeRentDao().findRecordsById(id)
  console.log('detailData.value', detailData.value)
}

const normalItems = computed(() => {
  console.log(detailData.value)
  return detailData.value?.list?.filter(item => {
    return !(detailData.value?.priceUpList?.some(i => i.rid === item.rid) || detailData.value?.priceDownList?.some(i => i.rid === item.rid)
      || detailData.value?.added?.some(i => i.rid === item.rid) || detailData.value?.removed?.some(i => i.rid === item.rid))
  })
})

async function deleteRecord() {
  await KeRentDao().deleteRecordById(id)
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
      (租房)小区任务运行记录
      <span class="text-blue-500">{{ detailData.name }}</span>
      [<span class="text-blue-500">{{ id }}</span>]
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
          <th>平均价格</th>
          <th class="text-blue-500 font-bold italic">{{ detailData.avgPrice }}元/月</th>
        </tr>


        <tr>
          <th>在售数量</th>
          <th class="">{{ detailData.count }}</th>
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
          <th class="">{{ detailData.added?.length }}</th>
        </tr>
        <tr>
          <th class="line-through">下架数量🛒</th>
          <th class="">{{ detailData.removed?.length }}</th>
        </tr>
        <tr>
          <th>未变化数量</th>
          <th class="">{{
            (detailData.count ?? 0) - (detailData?.priceDownList?.length ?? 0) - (detailData?.priceUpList?.length
              ??
              0)
            - (detailData?.added?.length ?? 0) - (detailData?.removed?.length ?? 0)
          }}
          </th>
        </tr>

      </tbody>
    </table>


    <h2 class="my-4 border-b font-bold text-2xl">房源详情</h2>
    <div class="flex flex-col gap-2 ">
      <template v-for="item in detailData.removed">
        <div class="flex flex-row gap-4 border bg-neutral-100">
          <div class="min-w-20 text-sm">下架</div>
          <Component :is="RentHouseDetailUrl(item.rid)" />

          <TotalPriceItem :price="item.price" :id="item.rid" :link-func="genOptionKeRentHouseUrl" unit="元/月" />
        </div>
      </template>
      <template v-for="item in detailData.added">
        <div class="flex flex-row gap-4 border bg-blue-100">
          <div class="min-w-20">🆕新上架</div>
          <Component :is="RentHouseDetailUrl(item.rid)" />

          <TotalPriceItem :price="item.price" :id="item.rid" :link-func="genOptionKeRentHouseUrl" unit="元/月" />
        </div>
      </template>

      <template v-for="item in detailData.priceDownList">
        <div class="flex flex-row items-center gap-4 border bg-green-100">
          <div class="min-w-20">📉降价</div>
          <Component :is="RentHouseDetailUrl(item.rid)" />
          <NewPriceChangeBudget :new-value="item.price" :old-value="item.oldPrice" unit="元/月" />

        </div>
      </template>

      <template v-for="item in detailData.priceUpList">
        <div class="flex flex-row items-center gap-4 border bg-red-100">
          <div class="min-w-20">📈涨价</div>
          <Component :is="RentHouseDetailUrl(item.rid)" />

          <NewPriceChangeBudget :new-value="item.price" :old-value="item.oldPrice" unit="元/月" />

        </div>
      </template>

      <template v-for="item in normalItems">
        <div class="flex flex-row flex-nowrap gap-4 border">
          <div class="min-w-20">
          </div>
          <Component :is="RentHouseDetailUrl(item.rid)" />

          <TotalPriceItem :price="item.price" :id="item.rid" :link-func="genOptionKeRentHouseUrl" unit="元/月" />
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