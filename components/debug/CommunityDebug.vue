<script setup lang="ts">

import {db} from "@/utils/client/Dexie";
import {CommunityRecord} from "@/types/lj";
import ObjectTable from "@/components/table/ObjectTable.vue";
import {random, toInt} from "radash";


const recordIdOfToChange = ref<number | undefined>(-1)
const recordToChange = ref<CommunityRecord | undefined>()
onMounted(async () => {
  const lastRecord = await db.communityRecords.toCollection().last()
  recordIdOfToChange.value = lastRecord?.id
  recordToChange.value = lastRecord

})


async function queryRecord() {
  recordToChange.value = await db.communityRecords.get(recordIdOfToChange.value)
}

async function randChangePrice() {
  const record = await db.communityRecords.update(recordIdOfToChange.value, {
    avgUnitPrice: toInt(recordToChange.value?.avgUnitPrice ?? 50) + random(-50, 50)
  })
  console.log(record)
  queryRecord()

}
</script>

<template>
  <div class="c-block">
    <h1>Community Debug</h1>
    <div class="c-block">
      <h2>random Change Record</h2>
      <div>

        record id: <input type="number" v-model="recordIdOfToChange"/>
        <button @click="queryRecord()">refresh</button>
      </div>

      <div>
        <button @click="randChangePrice">avg Price</button>

      </div>

    </div>
    <div>
      <ObjectTable :data="recordToChange"/>
    </div>
  </div>


</template>

<style scoped>

</style>