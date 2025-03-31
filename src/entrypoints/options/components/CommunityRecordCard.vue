<script setup lang="ts">
import {CommunityRecord} from "@/types/lj";
import {Label} from "@/components/ui/label";

const {record}=defineProps<{record:CommunityRecord}>()

</script>

<template>


  <div class="flex flex-col gap-1 border p-1">
    <div class="flex flex-row justify-between gap-3">
      <a :href="'/options.html#/c/task/detail?id='+record.cid"
         target="_blank"
         class="text-green-500 underline">{{record.cid}}</a>
      <span>
        <label class="text-neutral-600 font-light">城市:</label>
        <span class="text-green-700 font-bold">{{record.city}}</span>
      </span>
      <span>
        <label class="text-neutral-600 font-light">名字:              </label>
        <span class="text-green-700 font-bold">{{record.name}}     </span>
      </span>

    </div>

    <div class="flex flex-row justify-between  gap-3">
      <div>
        <label class="text-neutral-600 font-light">在售数量:             </label>
        <span class="text-green-700 font-bold">{{record.calcOnSellCount}}套   </span>
      </div>
      <div class="">
        <label class="text-neutral-600 font-light">平均均价: </label>
        <span class="text-green-700 font-bold">{{record.avgUnitPrice}} 元/平米</span>
      </div>
      <div class="">
        <label class="text-neutral-600 font-light">平均总价: </label>
        <span class="text-green-700 font-bold">{{record.avgTotalPrice}} 万元</span>
      </div>

      <div class="">
        <label class="text-neutral-600 font-light">近90天成交量: </label>
        <span class="text-green-700 font-bold">{{record.doneCountIn90Days}} </span>
      </div>
      <div class="">
        <label class="text-neutral-600 font-light">近90天带看量: </label>
        <span class="text-green-700 font-bold">{{record.visitCountIn90Days}} </span>
      </div>
    </div>

    <div class="flex flex-row justify-around gap-3">

    </div>

    <div>
      <details>
        <summary>全部列表 (共{{record.houseList.length}}个)</summary>
        <div>
          <div v-for="(houseItem,index) in record.houseList" class="flex gap-3 border">
            <div> {{index}} .</div>
            <div> {{houseItem.hid}}</div>
            <div> {{houseItem.price}}万元</div>
            <div> {{houseItem.name}}</div>
          </div>

        </div>
      </details>
    </div>

  </div>
</template>

<style scoped>

</style>