<script setup lang="ts">

import { RentCommunityRecord } from "@/types/rent";

const { record } = defineProps<{ record: RentCommunityRecord }>()

</script>

<template>


  <div class="flex flex-col gap-1 border p-1">
    <div class="flex flex-row justify-between gap-3">
      <a :href="'/options.html#/c/task/detail?id=' + record.cid" target="_blank"
        class="text-green-500 underline">{{ record.cid }}</a>
      <span>
        <label class="text-neutral-600 font-light">城市:</label>
        <span class="text-green-700 font-bold">{{ record.city }}</span>
      </span>
      <span>
        <label class="text-neutral-600 font-light">名字: </label>
        <span class="text-green-700 font-bold">{{ record.name }} </span>
      </span>

    </div>

    <div class="flex flex-row justify-between  gap-3">
      <div>
        <label class="text-neutral-600 font-light">在售数量: </label>
        <span class="text-green-700 font-bold">{{ record.count }}套 </span>
      </div>
      <div class="">
        <label class="text-neutral-600 font-light">均价: </label>
        <span class="text-green-700 font-bold">{{ record.avgPrice }} 元/月</span>
      </div>

    </div>

    <div class="flex flex-row justify-around gap-3">

    </div>

    <div>
      <details>
        <summary>全部列表 (共{{ record.count }}个)</summary>
        <div>
          <div v-for="(houseItem, index) in record.list" class="flex gap-3 border">
            <div> {{ index }} .</div>
            <div> {{ houseItem.rid }}</div>
            <div> {{ houseItem.price }} 元/月</div>
            <div> {{ houseItem.name }}</div>
          </div>

        </div>
      </details>
    </div>

  </div>
</template>

<style scoped></style>