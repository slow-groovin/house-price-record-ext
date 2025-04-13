<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { useExtInfo } from '@/composables/useExtInfo';
import { sleep } from 'radash';
import { onMounted, ref } from 'vue';
import { toast } from 'vue-sonner';
import { db } from '@/entrypoints/db/Dexie';
import { CommonFieldChange, CommunityRecord, CommunityTask, HouseChange, HouseTask } from '@/types/lj';
import { getIndexedDBUsage } from '@/utils/browser';
import { AccessRecord } from '@/utils/lib/AcessRecord';
import { BulkError, EntityTable } from 'dexie';
import { useTemplateRef } from 'vue'; // Keeping as per reference for now
import { z } from 'zod';
import { useDevSetting } from '@/entrypoints/reuse/global-variables';
import { getDb } from '@/entrypoints/db/sqlite';
import { exportDatabase, importDatabaseToIdb, initSQLite } from '@subframe7536/sqlite-wasm';
import { useIdbStorage } from '@subframe7536/sqlite-wasm/idb';
import { KeRentDao } from '@/entrypoints/db/rent-dao';
import Code from '@/components/information/Code.vue';
import { TaskGroup2 } from '@/types/group';

// Compatibility version from reference code
const compatibilityVersion = 20250402;
const minimumCompatibleVersion = '1.1.0';
type ExportDataStructure = {
  name: 'house-price-ext', // fixed string from reference
  version: string,
  compatibilityVersion: number,
  exportDate: string,
  "lj": {
    communities: any[],
    houses: any[],
    records: any[],
    changes: any[],
    statusChanges: any[],
    fieldChanges: any[],
  },
  "ke-rent": {
    communities: any[],
    houses: any[],
    records: any[],
    priceChanges: any[],
    statusChanges: any[],
  },
  groups: TaskGroup2[]
}

// Verify fields schema from reference code
const importSchema = z.object({
  name: z.literal('house-price-ext'),
  version: z.string(),
  // Allow any compatibilityVersion for now, or adjust validation as needed
  compatibilityVersion: z.literal(compatibilityVersion),
  exportDate: z.string(),
  "lj": z.object({
    communities: z.array(z.any()),
    houses: z.array(z.any()),
    records: z.array(z.any()),
    changes: z.array(z.any()),
    statusChanges: z.array(z.any()),
    fieldChanges: z.array(z.any()),
  }),
  "ke-rent": z.object({
    communities: z.array(z.any()),
    houses: z.array(z.any()),
    records: z.array(z.any()),
    priceChanges: z.array(z.any()),
    statusChanges: z.array(z.any()),
  }),
  groups: z.array(
    z.object({
      id: z.number().optional(),
      name: z.string(),
      ljSellCidList: z.array(z.string()),
      ljSellHidList: z.array(z.string()),
      keRentCidList: z.array(z.string()),
      createdAt: z.number(),
      lastRunningAt: z.number().optional(),
      notification: z.boolean().optional(),
      notifyInterval: z.number().optional(),
    })
  )

});

const fieldsMap: Record<string, string> = {
  communities: '小区任务',
  houses: '房源任务',
  records: '小区运行记录',
  changes: '价格变更',
  'priceChanges': '价格变更',
  statusChanges: '状态变更',
  fieldChanges: '字段变更',
}

const { name, version } = useExtInfo();
const { isDebug } = useDevSetting()
const isLoading = ref(false);
const importPreview = ref<Record<string, Record<string, number> | any> | null>();
const fileInputText = ref<string>()
const fileInput = useTemplateRef<HTMLInputElement>('fileInput'); // Adjusted type hint
const usedMb = ref(0)

type ImportResult = Record<string, { suc: number, fail: number }>
const ljSellImportResult = ref<ImportResult>()
const keRentImportResult = ref<ImportResult>()
const groupImportResult = ref<ImportResult>()

async function importData() {
  isLoading.value = true;

  await sleep(100); // waiting for loading spin anim


  if (!fileInputText.value) {
    alert("请先选择导入文件.")
    return
  }

  try {
    const text = fileInputText.value
    const parsedResult = importSchema.safeParse(JSON.parse(text));

    if (!parsedResult.success) {
      alertAndToast({ title: '导入文件解析失败', description: ' Error: ' + parsedResult.error.toString(), variant: 'destructive' });
      isLoading.value = false;
      return;
    }

    const { lj, "ke-rent": keRent, groups } = parsedResult.data;
    ljSellImportResult.value = await insertLjSellData(lj)
    keRentImportResult.value = await insertKeRentData(keRent)
    groupImportResult.value = await insertGroup(groups)
  } catch (e: any) {

    if (e.name === 'AbortError') { // Handle user cancelling file picker
      toast({ title: 'Canceled' });
      return;
    }
    console.error('import config failed: ', e);
    alertAndToast({ title: 'Import Error', description: 'Error: ' + e.message, variant: 'destructive' });
    return;
  } finally {
    isLoading.value = false;
    importPreview.value = null

  }

  alertAndToast({ title: '导入成功!', description: '导入成功, 请查看导入结果!', variant: 'success' });
}

/**
 * export
 */
async function exportData() {
  isLoading.value = true;
  await sleep(100); // Ensure loading state is visible

  try {

    const data: ExportDataStructure = {
      name: 'house-price-ext', // Use fixed name from reference
      version: version, // Use extension version
      compatibilityVersion: compatibilityVersion,
      exportDate: new Date().toLocaleString(),
      'lj': await retrieveData(),
      "ke-rent": await KeRentDao().exportAll(),
      groups: await db.taskGroups.toArray(),
    };

    // Use extension name and version in filename
    exportToJsonFile(`${name}-configs-export-${version}-${new Date().toISOString().split('T')[0]}.json`, data);

    alertAndToast({ title: '导出成功', description: '导出成功!', variant: 'success' });

  } catch (e: any) {
    console.error('export config failed: ', e);
    alertAndToast({ title: '导出失败', description: 'Error: ' + e.message, variant: 'destructive' });
  } finally {
    isLoading.value = false;
  }
}

function exportToJsonFile(filename: string, jsonData: any) {
  try {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append to body for Firefox compatibility
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url);
  } catch (e: any) {
    console.error('Failed to trigger download:', e);
    alertAndToast({ title: '下载错误', description: 'Could not create download link. Error: ' + e.message, variant: 'destructive' });
  }
}

function exportToFile(filename: string, uint8Data: Uint8Array) {
  try {
    // 直接使用 Uint8Array 创建 Blob，不需要 JSON.stringify
    const blob = new Blob([uint8Data], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append to body for Firefox compatibility
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url);
  } catch (e: any) {
    console.error('Failed to trigger download:', e);
    alertAndToast({
      title: '下载错误',
      description: 'Could not create download link. Error: ' + e.message,
      variant: 'destructive'
    });
  }
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    try {
      const text = await file.text()
      fileInputText.value = text
      const dataObj = JSON.parse(text);

      importPreview.value = {
        version: dataObj.version,
        compatibilityVersion: dataObj.compatibilityVersion,
        exportDate: dataObj.exportDate,
        'lj': Object.fromEntries(
          Object.entries(dataObj['lj']).map(([key, arr]) => [key, (arr as Array<unknown>).length + '条'])
        ),
        'ke-rent':
          Object.fromEntries(
            Object.entries(dataObj['ke-rent']).map(([key, arr]) => [key, (arr as Array<unknown>).length + '条'])
          ),
        'groups': dataObj.groups

      }
    } catch (e: any) {
      console.error('Failed to parse selected file for view:', e);
      alertAndToast({ title: '文件读取错误', description: '无法读取文件, 请检查内容是否是合法JSON? Error: ' + e.message, variant: 'destructive' });
      importPreview.value = null; // Clear previous view data on error
    }
  } else {
    importPreview.value = null; // Clear view data if no file is selected
  }
}


async function retrieveData(): Promise<ExportDataStructure['lj']> {
  const communities = await db.communityTasks.toCollection().toArray()
  const houses = await db.houseTasks.toCollection().toArray()
  const records = await db.communityRecords.toCollection().toArray()
  const changes = await db.houseChanges.toCollection().toArray()
  const statusChanges = await db.houseStatusChanges.toCollection().toArray()
  const fieldChanges = await db.houseCommonFieldChanges.toCollection().toArray()
  return {
    communities,
    houses,
    records,
    changes,
    statusChanges,
    fieldChanges,
  }
}


const BATCH_SIZE = 10
async function insertLjSellData(data: ExportDataStructure['lj']) {
  /**
 * 插入导入记录的函数
 * 分批插入记录
 * @param records 
 * @param entityTable 
 */
  //尝试转换特殊字段
  async function insertRecords<T extends { id?: string | number }>(records: T[], entityTable: EntityTable<T, "id">) {
    if (!records || !records[0]) {
      return { fail: 0, suc: 0 }
    }
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
  const _importResult: ImportResult = {}



  /**
   * community tasks
   */
  const communities = data.communities as CommunityTask[]
  _importResult['小区任务'] = await insertRecords(communities, db.communityTasks)

  /**
   * house tasks
   */
  const houses = data.houses as HouseTask[]
  _importResult['房源任务'] = await insertRecords(houses, db.houseTasks)

  const records = data.records as CommunityRecord[]
  _importResult['小区运行历史'] = await insertRecords(records, db.communityRecords)

  _importResult['价格变更'] = await insertRecords(data.changes as HouseChange[], db.houseChanges)
  _importResult['状态变化'] = await insertRecords(data.statusChanges as HouseChange[], db.houseStatusChanges)
  _importResult['房源字段变更'] = await insertRecords(data.fieldChanges as CommonFieldChange[], db.houseCommonFieldChanges)
  return _importResult
}

async function insertKeRentData(data: ExportDataStructure['ke-rent']) {
  const _importResult: ImportResult = {}

  const insertCounts = await KeRentDao().importAll(data)
  const [count1, count2, count3, count4, count5] = insertCounts
  _importResult['小区任务'] = { fail: data.communities.length - count1, suc: count1 }
  _importResult['房源'] = { fail: data.houses.length - count2, suc: count2 }
  _importResult['小区运行记录'] = { fail: data.records.length - count3, suc: count3 }
  _importResult['价格变更'] = { fail: data.priceChanges.length - count4, suc: count4 }
  _importResult['状态变更'] = { fail: data.statusChanges.length - count5, suc: count5 }
  return _importResult
}

async function insertGroup(data: ExportDataStructure['groups']) {

  const _importResult: ImportResult = {}
  let suc = 0, fail = 0
  try {
    suc = await db.taskGroups.bulkPut(data) ?? 0
  } catch (_e: any) {
    if (_e.name !== 'BulkError') throw _e
    const e = _e as BulkError
    fail = e.failures.length
  }
  _importResult['分组'] = { fail, suc }
  return _importResult
}


// Helper for showing alert and toast notification
function alertAndToast(args: { title: string, description: string, variant: 'destructive' | 'success' }) {
  // Simple alert as fallback or primary notification
  alert(args.title);
  // Show toast using the imported function

  if (args.variant === 'destructive') {
    console.log(args)
    toast.error(args.title, { description: args.description })
  } else if (args.variant === 'success') {
    toast.success(args.title, { description: args.description })
  }
}

onMounted(async () => {
  getIndexedDBUsage().then(rs => {
    usedMb.value = rs.usage
  })
})

async function testExportSqlite() {
  const db = await getDb()
  const buffer = await db.dump()
  exportToFile('test.sqlite', buffer)

}

async function testImportSqlite(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  console.log('target.files', target.files)

  if (file) {
    const db = await initSQLite(
      useIdbStorage("test-import.db", {
        url: "/wa-sqlite-async.wasm",
        lockTimeout: 500,
      })
    );
    console.log('db.path', db.path)

    // const rs = await importDatabaseToIdb(db.vfs, db.path, file.stream())

  }
}


</script>

<template>
  <h1 class="text-2xl mb-4">导入/导出</h1>
  <blockquote>
    当前数据总量大小约: {{ (usedMb)?.toFixed(2) }}MB
  </blockquote>
  <blockquote>
    最早兼容版本: <Code>{{ minimumCompatibleVersion }}</Code>
  </blockquote>
  <div v-if="isDebug">
    <Button @click="testExportSqlite()">export</Button>
    <input type="file"
      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      @change="testImportSqlite" accept=".sqlite" />
  </div>

  <div v-if="isLoading" class="flex justify-center items-center mt-4">
    <div class="size-8 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
    <span class="ml-2">处理中...</span>
  </div>

  <div v-else class="flex flex-col gap-8 mt-4">
    <!-- Export Section -->
    <div>
      <h2>导出</h2>
      <!-- Removed API Key checkbox as the related logic was removed -->
      <Button @click="exportData" class="mr-4">导出数据</Button>
    </div>

    <!-- Import Section -->
    <div class="flex flex-col gap-4 items-start">
      <h2>导入</h2>
      <p class="text-sm text-gray-600 mb-1">从一个json文件中导入数据.</p>
      <input type="file"
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        ref="fileInput" @change="handleFileSelect" accept=".json,application/json" />
      <span class="text-red-500 text-sm">导入将会覆盖.</span>

      <Button @click="importData" :disabled="!fileInput?.files?.length"
        :class="{ 'animate-bounce': !!importPreview && fileInput?.files?.length }">导入数据</Button>

      <!-- View Area -->
      <div v-if="importPreview" class="mt-4 p-4 border rounded-md w-full bg-gray-50 max-h-96 overflow-auto">
        <h3 class="text-lg font-semibold mb-2 border-b pb-1">导入数据预览</h3>
        <div class="text-sm grid grid-cols-[max-content,1fr] gap-x-4 gap-y-1">
          <strong class="text-gray-700">导出日期:</strong> <span>{{ importPreview.exportDate || 'N/A' }}</span>
          <strong class="text-gray-700">导出插件版本:</strong> <span>{{ importPreview.version || 'N/A' }}</span>
          <strong class="text-gray-700">兼容性版本:</strong> <span>{{ importPreview.compatibilityVersion ?? 'N/A'
          }}</span>
        </div>
        <h4 class="text-md font-semibold mt-3 mb-1">数据:</h4>


        <h4 class="font-semibold mt-3 mb-1">lj-二手房:</h4>
        <template v-if="importPreview.lj && Object.keys(importPreview.lj).length > 0">
          <div v-for="(value, key) in importPreview.lj" :key="key" class="mb-1 flex items-center">
            <div class=" hover:bg-gray-200 p-1 rounded text-sm font-medium">{{ fieldsMap[key] }}:</div>
            <div class="rounded text-xs overflow-auto">{{ value }}</div>
          </div>
        </template>

        <h4 class="font-semibold mt-3 mb-1">beike-租房:</h4>
        <template v-if="importPreview['ke-rent'] && Object.keys(importPreview['ke-rent']).length > 0">
          <div v-for="(value, key) in importPreview['ke-rent']" :key="key" class="mb-1 flex items-center">
            <div class=" hover:bg-gray-200 p-1 rounded text-sm font-medium">{{ fieldsMap[key] }}:</div>
            <div class="rounded text-xs overflow-auto">{{ value }}</div>
          </div>
        </template>

        <h4 class="font-semibold mt-3 mb-1">任务分组:</h4>
        <template v-if="importPreview['groups'] && (importPreview['groups'] as any[]).length > 0">
          <div class="mb-1 flex items-center">
            <div class=" hover:bg-gray-200 p-1 rounded text-sm font-medium"> 数量:</div>
            <div class="rounded text-xs overflow-auto">{{ (importPreview['groups'] as any[]).length }}</div>
          </div>
        </template>
      </div>
      <p v-else-if="fileInput?.files?.length" class="text-sm text-gray-500 mt-2">无法预览文件中数据.</p>

    </div>

    <!-- 导入执行结果 -->
    <div v-if="ljSellImportResult"
      class="flex flex-col gap-4 p-4 mt-4 w-fit rounded-lg shadow-md bg-gray-50 dark:bg-gray-700">
      <div class="text-lg font-semibold text-green-600 dark:text-green-400">导入完毕!</div>

      <div class="text-lg font-semibold text-green-600 dark:text-green-400">lj-二手房:</div>
      <template v-for="(item, key) in ljSellImportResult" :key="key">
        <div class="flex items-center space-x-2">
          <span
            class="inline-block bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
            {{ key }}
          </span>
          <span class="font-semibold text-green-700 mr-8">成功
            <span class="font-bold text-green-600"> {{ item.suc }}</span> 条
          </span>
          <span class="font-semibold text-gray-500">
            失败 <span class="font-bold text-black">{{ item.fail }}</span> 条
          </span>
        </div>
      </template>

      <div class="text-lg font-semibold text-green-600 dark:text-green-400">ke-租房:</div>
      <template v-for="(item, key) in keRentImportResult" :key="key">
        <div class="flex items-center space-x-2">
          <span
            class="inline-block bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
            {{ key }}
          </span>
          <span class="font-semibold text-green-700 mr-8">成功
            <span class="font-bold text-green-600"> {{ item.suc }}</span> 条
          </span>
          <span class="font-semibold text-gray-500">
            失败 <span class="font-bold text-black">{{ item.fail }}</span> 条
          </span>
        </div>
      </template>

      <div class="text-lg font-semibold text-green-600 dark:text-green-400">分组:</div>
      <template v-for="(item, key) in groupImportResult" :key="key">
        <div class="flex items-center space-x-2">
          <span
            class="inline-block bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
            {{ key }}
          </span>
          <span class="font-semibold text-green-700 mr-8">成功
            <span class="font-bold text-green-600"> {{ item.suc }}</span> 条
          </span>
          <span class="font-semibold text-gray-500">
            失败 <span class="font-bold text-black">{{ item.fail }}</span> 条
          </span>
        </div>
      </template>


    </div>


  </div>
</template>

<style lang="postcss" scoped>
h2 {
  @apply text-xl font-semibold mb-2;
  /* Adjusted size */
}

/* Add other styles if needed */
</style>
