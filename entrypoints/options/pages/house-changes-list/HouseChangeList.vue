<script setup lang="ts">
//
import {db} from "@/utils/client/Dexie";
import {CommunityTask, HouseChange, HouseTask} from "@/types/lj";
import {calcOffset, PageState} from "@/utils/table-utils";
import {QueryCache} from "@/utils/lib/QueryCache";
import HouseChangesTable from "@/entrypoints/options/components/HouseChangesTable.vue";


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
const data = ref<HouseChange[]>([])
const rowCount=ref(0)
async function queryData() {
  //changes
  data.value = await db.houseChanges
    .offset(calcOffset(pagination.value.pageIndex, pagination.value.pageSize))
    .limit(pagination.value.pageSize)
    .reverse()
    .toArray()
  rowCount.value = await db.houseChanges.count()
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
  <HouseChangesTable :data="data" :row-count="rowCount"  @on-pagination-change="onPaginationChange"></HouseChangesTable>


</template>

<style scoped>

</style>