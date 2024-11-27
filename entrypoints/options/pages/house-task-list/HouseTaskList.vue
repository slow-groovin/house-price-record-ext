<script setup lang="ts">
import {db} from "@/utils/client/Dexie";
import {HouseTask} from "@/types/lj";
import {calcOffset} from "@/utils/table-utils";
import HouseTasksTable from "@/entrypoints/options/components/HouseTasksTable.vue";
import {onMounted, ref, watchEffect} from "vue";

/*
ref definition
 */
const data = ref<HouseTask[]>([])
const rowCount=ref(0)
/*
ref definition DONE
 */

/*
data
 */
async function queryData(pageIndex:number,pageSize:number) {
  data.value = await db.houseTasks.offset(calcOffset(pageIndex, pageSize)).limit(pageSize).toArray()
  rowCount.value = await db.houseTasks.count()
}
/*
data END
 */

onMounted(()=>{
})
</script>

<template>
  <HouseTasksTable :data="data" :row-count="rowCount" @on-pagination-change="queryData"/>

</template>

<style scoped>

</style>