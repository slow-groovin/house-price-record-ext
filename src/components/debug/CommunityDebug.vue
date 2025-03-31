<script setup lang="ts">

import { db } from "@/utils/client/Dexie";
import { CommunityRecord } from "@/types/lj";
import ObjectTable from "@/components/table/ObjectTable.vue";
import { list, random, uid } from "radash";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "radix-vue";
import { Button } from "@/components/ui/button";
import { doubleRand, ratioRand } from "@/utils/rand";
import { onMounted, ref, toRaw } from "vue";
import { useLocalStorage } from "@vueuse/core";
import { crawlOneCommunitySoldListPages } from "@/entrypoints/reuse/community-control2";


const recordIdOfToChange = ref<number | undefined>(-1)
const recordToChange = ref<CommunityRecord | undefined>()
const PREFIX = 'community-checkbox-'
/*
avg-total-price avg-unit-price calcOnSellCount doneCountIn90days onSellCount visitCountIn90Days house-list
 */
const checkAvgTotalPrice = useLocalStorage(PREFIX + 'avg-total-price', false)
const checkAvgUnitPrice = useLocalStorage(PREFIX + 'avg-unit-price', false)
const checkDoneCountIn90Days = useLocalStorage(PREFIX + 'done-count', false)
const checkOnSellCount = useLocalStorage(PREFIX + 'on-sell-count', false)
const checkVisitCountIn90Days = useLocalStorage(PREFIX + 'visit-count', false)
const checkHouseList = useLocalStorage(PREFIX + 'house-list', false)
const houseListChangeCount = useLocalStorage('community-input-house-list-count', 5)

onMounted(async () => {
  await refreshLastRecord()
})
async function refreshLastRecord() {
  const lastRecord = await db.communityRecords.toCollection().last()
  recordIdOfToChange.value = lastRecord?.id
  recordToChange.value = lastRecord
}

async function queryRecord() {
  recordToChange.value = await db.communityRecords.get(recordIdOfToChange.value)
}

async function randChange() {
  const changes: any = {}
  if (checkAvgTotalPrice.value) {
    changes.avgTotalPrice = ratioRand(recordToChange.value?.avgTotalPrice, 0.1)
  }
  if (checkAvgUnitPrice.value) {
    changes.avgUnitPrice = ratioRand(recordToChange.value?.avgUnitPrice, 0.1)
  }
  if (checkDoneCountIn90Days.value) {
    changes.doneCountIn90Days = doubleRand(recordToChange.value?.doneCountIn90Days)
  }
  if (checkOnSellCount.value) {
    changes.onSellCount = doubleRand(recordToChange.value?.onSellCount)
  }
  if (checkVisitCountIn90Days.value) {
    changes.visitCountIn90Days = doubleRand(recordToChange.value?.visitCountIn90Days)
  }
  if (checkHouseList.value && recordToChange.value?.houseList) {
    for (let _ of list(1, houseListChangeCount.value)) {
      const rand = random(0, 100)
      const randIndex = random(0, recordToChange.value?.houseList.length - 1)
      if (rand < 25) { //remove
        console.log('rand houseList change: remove first')
        recordToChange.value?.houseList.splice(randIndex, 1)
      } else if (rand < 50) { //add
        console.log('rand houseList change: add one')
        recordToChange.value?.houseList.push({
          hid: "by-debug-" + uid(4), price: 0
        })
      } else if (rand < 100) { //price up/down
        console.log('rand houseList change: change price')

        recordToChange.value.houseList![randIndex].price = ratioRand(recordToChange.value?.houseList[randIndex].price, 0.1)
      }
    }

    changes.houseList = toRaw(recordToChange.value?.houseList)
  }

  console.log("changes", changes)
  const record = await db.communityRecords.update(recordIdOfToChange.value, changes)
  console.log(record)
  await queryRecord()
}


</script>

<template>
  <div class="c-block">
    <h1>Community Debug</h1>
    <details>
      <summary>random Change Record</summary>
      <div class="c-block">
        <h2></h2>
        <div>
          record id: <input type="number" v-model="recordIdOfToChange" />
          <button @click="queryRecord()">query</button>
          <button @click="refreshLastRecord()">refresh last</button>
        </div>

        <div>
          <Checkbox id="avgUnitPrice" :default-checked="checkAvgUnitPrice"
            @update:checked="(_b) => checkAvgUnitPrice = _b" />
          <Label for="avgUnitPrice">avg Price</Label>
        </div>
        <div>
          <Checkbox id="avgTotalPrice" :default-checked="checkAvgTotalPrice"
            @update:checked="(_b) => checkAvgTotalPrice = _b" />
          <Label for="avgTotalPrice">avg Total Price</Label>
        </div>
        <div>
          <!--        done count -->
          <Checkbox id="doneCountIn90Days" :default-checked="checkDoneCountIn90Days"
            @update:checked="(_b) => checkDoneCountIn90Days = _b" />
          <Label for="doneCountIn90Days">doneCountIn90Days</Label>
        </div>
        <div>
          <Checkbox id="onSellCount" :default-checked="checkOnSellCount"
            @update:checked="(_b) => checkOnSellCount = _b" />
          <Label for="onSellCount">onSellCount</Label>
        </div>
        <!--      visit count-->
        <div>
          <Checkbox id="visitCountIn90Days" :default-checked="checkVisitCountIn90Days"
            @update:checked="(_b) => checkVisitCountIn90Days = _b" />
          <Label for="visitCountIn90Days">visitCountIn90Days</Label>
        </div>

        <div>
          <Checkbox id="houseList" :default-checked="checkHouseList" @update:checked="(_b) => checkHouseList = _b" />
          <Label for="houseList">houseList</Label>
          <input type="number" v-model="houseListChangeCount">
        </div>

        <Button @click="randChange">RAND CHANGE</Button>


      </div>
      <div>
        <ObjectTable :data="recordToChange" />
      </div>
    </details>


    <!-- sold  -->
    <details>
      <summary>sold crawl test</summary>
      <!-- 1728050867000: 2024-10-04 -->
      <Button
        @click="crawlOneCommunitySoldListPages({ cid: recordToChange?.cid!, city: recordToChange!.city!, lastRunningAt: 1728050867000 }).then(rs => console.log(rs))">sold
        crawl test
      </Button>
    </details>
  </div>


</template>

<style scoped></style>