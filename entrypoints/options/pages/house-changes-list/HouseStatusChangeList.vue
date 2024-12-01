<script setup lang="ts">
//
import {db} from "@/utils/client/Dexie";
import {CommunityTask, HouseChange, HouseStatusChange, HouseTask} from "@/types/lj";
import {calcOffset, PageState} from "@/utils/table-utils";
import {QueryCache} from "@/utils/lib/QueryCache";
import HouseChangesTable from "@/entrypoints/options/components/HouseChangesTable.vue";
import {onMounted, ref, watchEffect} from "vue";
import HouseStatusChangesTimeline from "@/entrypoints/options/components/HouseStatusChangesTimeline.vue";


/**
 * pagination
 */

const pagination = ref<PageState>({
  pageSize: 10,
  pageIndex: 1,
})

/**
 * pagination end
 */

/*
data
 */
const data = ref<HouseStatusChange[]>([])
const rowCount=ref(0)
async function queryData() {
  //changes
  data.value = await db.houseStatusChanges
    .offset(calcOffset(pagination.value.pageIndex, pagination.value.pageSize))
    .limit(pagination.value.pageSize)
    .reverse()
    .toArray()
  rowCount.value = await db.houseStatusChanges.count()
}
/*
data END
 */


onMounted(async () => {
  await queryData()
})

function onPaginationChange(pageIndex:number,pageSize:number){
  console.log('on pagination changed',pageIndex,pageSize)
  pagination.value={pageIndex,pageSize}
  queryData()
}
</script>

<template>
  <h1>H Changes</h1>
  <HouseStatusChangesTimeline :data="data" :row-count="rowCount"  @on-pagination-change="onPaginationChange"></HouseStatusChangesTimeline>


</template>

<style scoped>

</style>