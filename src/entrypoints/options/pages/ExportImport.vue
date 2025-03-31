<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { onMounted, ref } from "vue"
import { db } from "@/entrypoints/db/Dexie";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import { getIndexedDBUsage, usePreventUnload } from "@/utils/browser";
import { useExtTitle } from "@/composables/useExtInfo";
import { CommonFieldChange, CommunityRecord, CommunityTask, HouseChange, HouseTask } from "@/types/lj";
import { BulkError, EntityTable } from "dexie";
import { AccessRecord } from "@/utils/lib/AcessRecord";

useExtTitle('导入/导出')

const version = import.meta.env.VITE_EXT_VERSION ?? 'unknown';
const extName = import.meta.env.VITE_EXT_NAME ?? ''
const compatibilityVersion = 1
const usedMb = ref(0)
const isPending = ref(false)
const importResult = ref<ImportResult>()
type ExportDataStructure = {
  version: string,
  compatibilityVersion: number,
  lj: {
    ershoufang: {
      communities: any[],
      houses: any[],
      records: any[],
      changes: any[],
      statusChanges: any[],
      fieldChanges: any[],
    }
  },
}
type ImportResult = Record<string, { suc: number, fail: number }>
async function exportAllData() {
  isPending.value = true

  const communities = await db.communityTasks.toCollection().toArray()
  const houses = await db.houseTasks.toCollection().toArray()
  const records = await db.communityRecords.toCollection().toArray()
  const changes = await db.houseChanges.toCollection().toArray()
  const statusChanges = await db.houseStatusChanges.toCollection().toArray()
  const fieldChanges = await db.houseCommonFieldChanges.toCollection().toArray()

  const exportData: ExportDataStructure = {
    version: version,
    compatibilityVersion: compatibilityVersion,
    lj: {
      ershoufang: {
        communities: communities,
        houses: houses,
        records: records,
        changes: changes,
        statusChanges: statusChanges,
        fieldChanges: fieldChanges
      }
    }
  }
  exportJson(extName + '-export-' + version + '-' + new Date().toLocaleString() + '.json', exportData)
  isPending.value = false
}


function exportJson(filename: string, jsonData: any) {


  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename; // 设置下载的文件名
  a.click();
  URL.revokeObjectURL(url); // 释放 URL 对象
}

const importPickerOpts = {
  types: [
    {
      description: "JSON",
      accept: {
        "application/json": [".json"],
      },
    },
  ],
  'id': 'hp-ext',
  startIn: 'downloads',
  excludeAcceptAllOption: true,
  multiple: false,
};
onMounted(async () => {
  getIndexedDBUsage().then(rs => {
    usedMb.value = rs.usage
  })
})


async function importJson() {
  isPending.value = true
  const { preventUnload, cancelPreventUnload } = usePreventUnload()
  preventUnload()

  const _importResult: ImportResult = {}
  try {
    //@ts-ignore
    const [fileHandle] = await window.showOpenFilePicker(importPickerOpts);
    const file = await fileHandle.getFile();
    const contents = await file.text();

    const importObj = JSON.parse(contents) as ExportDataStructure
    if (!importObj.version || !importObj.lj || !importObj.compatibilityVersion) {
      alert(`导入失败, json文件内容格式非预期`)
      cancelPreventUnload()
      return
    }
    if (importObj.compatibilityVersion !== compatibilityVersion) {
      alert(`导入失败, json文件的插件版本[${importObj.version}] 与当前版本[${version}] 不兼容`)
      cancelPreventUnload()
      return
    }

    /**
     * community tasks
     */
    const communities = importObj.lj.ershoufang.communities as CommunityTask[]
    _importResult['小区任务'] = await insertRecords(communities, db.communityTasks)

    /**
     * house tasks
     */
    const houses = importObj.lj.ershoufang.houses as HouseTask[]
    _importResult['房源任务'] = await insertRecords(houses, db.houseTasks)

    const records = importObj.lj.ershoufang.records as CommunityRecord[]
    _importResult['小区运行历史'] = await insertRecords(records, db.communityRecords)

    _importResult['价格变更'] = await insertRecords(importObj.lj.ershoufang.changes as HouseChange[], db.houseChanges)
    _importResult['状态变化'] = await insertRecords(importObj.lj.ershoufang.statusChanges as HouseChange[], db.houseStatusChanges)
    _importResult['房源字段变更'] = await insertRecords(importObj.lj.ershoufang.fieldChanges as CommonFieldChange[], db.houseCommonFieldChanges)
  } catch (e: any) {
    if (e.name === 'AbortError') return
    console.error(e)
    alert(`导入失败:` + e)
    cancelPreventUnload()

  } finally {
    cancelPreventUnload()
    isPending.value = false

  }
  importResult.value = _importResult
}

const BATCH_SIZE = 10
/**
 * 插入导入记录的函数
 * 分批插入记录
 * @param records 
 * @param entityTable 
 */
async function insertRecords<T extends { id?: string | number }>(records: T[], entityTable: EntityTable<T, "id">) {
  //尝试转换特殊字段
  if ('accessRecord' in records[0]) {
    records.forEach(_c => {
      const c = _c as any
      if (!c?.accessRecord?.bitmap || !c?.accessRecord?.startDate) {
        return
      }
      const newBitMap = Object.values(c.accessRecord.bitmap as object)
      c.accessRecord = new AccessRecord(c.accessRecord.startDate, Uint32Array.from(newBitMap))
    })
  }

  let fail = 0, suc = records.length
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    try {
      await entityTable.bulkAdd(records.slice(i, i + BATCH_SIZE))
    } catch (_e: any) {
      if (_e.name !== 'BulkError') throw _e
      const e = _e as BulkError
      fail += e.failures.length
    }
  }

  suc -= fail
  return { fail, suc }
}
</script>

<template>
  <h1 class="text-3xl font-bold my-4">导入/导出</h1>
  <blockquote>
    当前数据总量大小约: {{ (usedMb)?.toFixed(2) }}MB
  </blockquote>

  <div class="relative flex gap-4">
    <Button @click="exportAllData">导出</Button>
    <Button @click="importJson">导入</Button>
    <LoadingOverlay v-if="isPending" :delay="0" />
  </div>

  <!-- 导入执行结果 -->
  <div v-if="importResult" class="flex flex-col gap-4 p-4 mt-4 w-fit rounded-lg shadow-md bg-gray-50 dark:bg-gray-700">
    <div class="text-lg font-semibold text-green-600 dark:text-green-400">导入完毕!</div>
    <template v-for="(item, key) in importResult" :key="index">
      <div class="flex items-center space-x-2">
        <span
          class="inline-block bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">{{
          key }}</span>
        <span class="font-semibold text-green-700 mr-8">成功 <span class="font-bold text-green-600">{{ item.suc }}</span>
          条</span>
        <span class="font-semibold text-gray-500">失败 <span class="font-bold text-black">{{ item.fail }}</span> 条</span>
      </div>
    </template>
  </div>
</template>

<style scoped></style>
