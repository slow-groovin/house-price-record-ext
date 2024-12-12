<script setup lang="ts">
import {useRoute} from "vue-router";
import {CommunityRecord} from "@/types/lj";
import {onMounted, ref} from "vue";
import {db} from "@/utils/client/Dexie";
import {formatDistanceToNowHoursOrDays} from "@/utils/date";
import {HouseDetailUrl} from "@/utils/url-component";
import DataEmptyState from "@/components/DataEmptyState.vue";

const {query}=useRoute()
const id=Number.parseInt(query['id'] as string)

const detailData=ref<CommunityRecord>()

async function queryData(){
  detailData.value=await db.communityRecords.get(id)
}

onMounted(()=>{
  queryData()
})
</script>

<template>
  <div v-if="!detailData">
    <DataEmptyState class="mt-64 mb-5"/>
    <div class="text-center text-xl text-black">记录ID: {{id}}</div>

  </div>
  <div v-else>
    <h1>小区任务运行记录</h1>
    <h1>{{id}}</h1>
    <blockquote>
      {{new Date(detailData.at).toLocaleString()}}({{formatDistanceToNowHoursOrDays(detailData.at)}})
    </blockquote>

    <div class="flex flex-col m-4">
      <div>
        <label>平均总价</label> &nbsp; &nbsp;
        <span>{{detailData.avgTotalPrice}}</span>
      </div>
      <div>
        <label>平均单价</label> &nbsp; &nbsp;
        <span>{{detailData.avgUnitPrice}}</span>
      </div>
      <div>
        <label>上架数量</label> &nbsp; &nbsp;
        <span>{{detailData.onSellCount}}</span>
      </div>
      <div>
        <label>访问量</label> &nbsp; &nbsp;
        <span>{{detailData.visitCountIn90Days}}</span>
      </div>
      <div>
        <label>售出量</label> &nbsp; &nbsp;
        <span>{{detailData.doneCountIn90Days}}</span>
      </div>
    </div>

    <div>
      <h2>涨价</h2>
      <div v-for="item in detailData.priceUpList" class="border border-t-0 p-3  flex flex-col">
        <div class="flex gap-4">
          <Component :is="HouseDetailUrl(item.hid)"/>

          <div>{{item.oldPrice}}</div> -> <div>{{item.price}}</div>
        </div>
      </div>
    </div>

    <div>
      <h2>降价</h2>
      <div v-for="item in detailData.priceDownList" class="border border-t-0 p-3  flex flex-col">
        <div class="flex gap-4">
          <Component :is="HouseDetailUrl(item.hid)"/>

          <div>{{item.oldPrice}}</div> -> <div>{{item.price}}</div>
        </div>
      </div>
    </div>

    <div>
      <h2>下架</h2>
      <div v-for="item in detailData.removedItem" class="border border-t-0 p-3  flex flex-col">
        <div class="flex gap-4">
          <Component :is="HouseDetailUrl(item.hid)"/>
          <div>{{item.price}}</div>
        </div>
      </div>
    </div>

    <div>
      <h2>上架</h2>
      <div v-for="item in detailData.addedItem" class="border border-t-0 p-3  flex flex-col">
        <div class="flex gap-4">
          <Component :is="HouseDetailUrl(item.hid)"/>
          <div>{{item.price}}</div>
        </div>
      </div>
    </div>

    <div>
      <h2>全部列表</h2>
      <div v-for="item in detailData.houseList" class="border border-t-0 p-3  flex flex-col">
        <div class="flex gap-4">
          <Component :is="HouseDetailUrl(item.hid)"/>
          <div>{{item.name}}</div>
          <div>{{item.price}}</div>
        </div>
      </div>
    </div>
  </div>

</template>

<style scoped lang="postcss">
h1{
  @apply text-2xl text-center
}
</style>