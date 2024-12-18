<script setup lang="ts">
import {Button} from "@/components/ui/button";
import {onMounted, ref} from "vue"
import {db} from "@/utils/client/Dexie";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import {getIndexedDBUsage} from "@/utils/browser";
import {useExtTitle} from "@/composables/useExtInfo";

useExtTitle('导入/导出')


const usedMb=ref(0)
const isPending = ref(false)

async function exportAllData() {
  isPending.value = true

  const allC = await db.communityTasks.toCollection().toArray()
  exportJson('community-tasks.json', allC)
  

  const allH = await db.houseTasks.toCollection().toArray()
  exportJson('house-tasks.json', allH)
  

  const allRecords = await db.communityRecords.toCollection().toArray()
  exportJson('community-records.json', allRecords)
  

  const allChanges = await db.houseChanges.toCollection().toArray()
  exportJson('house-price-changes.json', allChanges)
  

  const allStatusChanges = await db.houseStatusChanges.toCollection().toArray()
  exportJson('house-status-changes.json', allStatusChanges)
  

  const fieldChanges = await db.houseCommonFieldChanges.toCollection().toArray()
  exportJson('house-common-fields-changes.json', fieldChanges)
  

  isPending.value = false

}


function exportJson(filename: string, jsonData: any) {
  const blob = new Blob([JSON.stringify({
    version: import.meta.env.VITE_EXT_VERSION,
    data: jsonData
  }, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // 设置下载的文件名
  a.click();
  URL.revokeObjectURL(url); // 释放 URL 对象
}

onMounted(async () => {
  getIndexedDBUsage().then(rs=>{
    usedMb.value=rs.usage
  })
})


</script>

<template>
  <h1 class="text-3xl font-bold my-4">导入/导出</h1>
  <blockquote>
    当前数据总量大小约: {{ (usedMb)?.toFixed(2) }}MB
  </blockquote>

  <div class="relative">
    <Button @click="exportAllData">导出</Button>
    <Button disabled>导入(暂不支持)</Button>
    <LoadingOverlay v-if="isPending" :delay="0"/>
  </div>
</template>

<style scoped>

</style>