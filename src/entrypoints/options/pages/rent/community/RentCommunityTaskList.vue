<script setup lang="tsx">
//
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";
import AvgTotalPrice from "@/components/lj/column/AvgTotalPrice.vue";
import CidAndName from "@/components/lj/column/CidAndName.vue";
import OnSellCount from "@/components/lj/column/OnSellCount.vue";
import TwoLineAt from "@/components/lj/column/TwoLineAt.vue";
import ColumnVisibleOption from "@/components/table/ColumnVisibleOption.vue";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExtTitle } from "@/composables/useExtInfo";
import { useRouterQuery } from "@/composables/useRouterQuery";
import { KeRentDao } from '@/entrypoints/db/rent-dao';
import GenericSortDock from "@/entrypoints/options/components/GenericSortDock.vue";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import RentCommunityQueryDock from '@/entrypoints/options/components/rent/RentCommunityQueryDock.vue';
import { goRunCommunityTasksStartPage } from "@/entrypoints/reuse/community-control"
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import { newQueryConditionFromQueryParam } from "@/entrypoints/reuse/query-condition";
import {
  communityQueryConditionTemplate,
  frequentFieldZhMap,
  rentCommunityQueryConditionTemplate,
  SortState
} from "@/types/query-condition";
import { ArgCache } from "@/utils/lib/ArgCache";
import { tryMinusOrUndefined } from "@/utils/operator";
import { valueUpdater } from "@/utils/shadcn-utils";
import { PageState } from "@/utils/table-utils";
import { mergeParams } from "@/utils/variable";
import {
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  TableOptions,
  useVueTable,
  VisibilityState,
} from '@tanstack/vue-table';
import { useLocalStorage } from "@vueuse/core";
import { isNumber, toInt } from "radash";
import { computed, onMounted, ref, toRaw } from "vue";
import { useRoute } from "vue-router";
import { RentCommunityQueryCondition } from '../../../../../types/query-condition';
import { RentCommunityTask } from '../../../../../types/rent';
import { goRunRentCommunityTasksStartPage } from "@/entrypoints/reuse/rent-community-control";

const { isDebug } = useDevSetting()
useExtTitle('租房小区任务列表')
const { query } = useRoute()
const { _pageIndex, _pageSize } = query
const { pushQuery, removeQueries, pushQueries, removeQuery } = useRouterQuery()


/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = useLocalStorage<VisibilityState>('community-list-column-visibility', {})
const rowSelection = ref<RowSelectionState>({})

let value = newQueryConditionFromQueryParam(rentCommunityQueryConditionTemplate, query);
const queryCondition = ref<RentCommunityQueryCondition>(value)
const sortCondition = ref<SortState<RentCommunityTask>>({})

const queryCost = ref(0)
const isPending = ref(false)

const selectionCount = computed(() => Object.keys(rowSelection.value).length)
const queryScopeLabel = ref('')


if (query.groupId) {
  queryScopeLabel.value = `分组:[${query.groupId}]`
}

/*
ref definition DONE
 */


/**
 * pagination
 */
const storagePageSize = localStorage.getItem('community-list-page-size')
const pagination = ref<PageState>({
  pageSize: mergeParams(_pageSize, storagePageSize) ? Number(mergeParams(_pageSize, storagePageSize)) : 10,
  pageIndex: _pageIndex ? Number(_pageIndex) : 1,
})

const argCache = new ArgCache()
/**
 * pagination end
 */

/*
data
 */
type RelatedData = {
  avgPrice?: number,
  avgPriceChange?: number, //相比之前一次记录的总价变化
  onSellCount?: number,
  onSellCountChange?: number//相比之前一次记录的数量变化,
  priceUpCount?: number,
  priceDownCount?: number,
  addedCount?: number,
  removedCount?: number,
}
const data = ref<RentCommunityTask[]>([])
const rowCount = ref(0)
const relatedData = ref<Record<string, RelatedData>>({})

async function queryData(_pageIndex?: number, _pageSize?: number) {
  console.debug('[KeRentCommunityTaskList] queryData()', _pageIndex, _pageSize)
  const pageIndex = argCache.retrieve('pageIndex', _pageIndex, 1)
  const pageSize = argCache.retrieve('pageSize', _pageSize, 10)
  const beginAt = Date.now()
  isPending.value = true


  let results = await KeRentDao().findManyCommunities({
    pageIndex, pageSize
  }, queryCondition.value
    , sortCondition.value)

  queryCost.value = Date.now() - beginAt
  isPending.value = false

  await queryRelatedData(results.data)
  data.value = results.data // after query related data, trigger render
  rowCount.value = results.count

  resetPaginationIfNoData()
}

async function queryRelatedData(communityData: typeof data.value) {
  // relatedData.value = {}
  const cidList = communityData.map(item => item.cid)
  for (let cid of cidList) {
    const lastTwoRecords = await KeRentDao().findLastTwoRecordsByCid(cid)
    if (lastTwoRecords[0]) {
      relatedData.value[cid] = {}
      relatedData.value[cid].avgPrice = lastTwoRecords[0].avgPrice
      relatedData.value[cid].onSellCount = lastTwoRecords[0].list?.length ?? 0
      relatedData.value[cid].addedCount = lastTwoRecords[0].added?.length
      relatedData.value[cid].removedCount = lastTwoRecords[0].removed?.length
      relatedData.value[cid].priceUpCount = lastTwoRecords[0].priceUpList?.length
      relatedData.value[cid].priceDownCount = lastTwoRecords[0].priceDownList?.length
    }
    if (lastTwoRecords[0] && lastTwoRecords[1]) {
      relatedData.value[cid].avgPriceChange = tryMinusOrUndefined(lastTwoRecords[0]?.avgPrice, lastTwoRecords[1]?.avgPrice)
      relatedData.value[cid].onSellCountChange = tryMinusOrUndefined(lastTwoRecords[0]?.count, lastTwoRecords[1]?.count)
    }
  }
}

/*
data END
 */

/*
column BEGIN
 */
const columnHelper = createColumnHelper<RentCommunityTask>()
const columnDef: (ColumnDef<RentCommunityTask>)[] = [
  {
    id: 'select',
    header: ({ table }: { table: any }) => {
      return (
        <input type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}></input>
      )
    },
    cell: ({ row }: { row: any }) => {
      return (
        <div class="px-1">
          <input type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}></input>
        </div>
      )
    },
  },
  // {accessorKey: 'id',},
  {
    accessorKey: 'name',
    id: '名字',
    header: '名字',
    accessorFn: (originalRow, index) => {
      return { name: originalRow.name, cid: originalRow.cid, city: originalRow.city }
    },
    cell: ({ cell }) => {
      const { name, cid, city } = cell.getValue() as { name: string, cid: string, city: string }
      return <CidAndName name={name} id={cid} city={city} type="ke-rent" />
    },
  },
  { accessorKey: 'city', id: "城市", header: '城市' },
  {
    accessorKey: 'cid',
    header: '在租数量',
    id: '在租数量',
    cell: ({ cell }) => <OnSellCount value={relatedData.value[cell.row.original.cid]?.onSellCount}
      change={relatedData.value[cell.row.original.cid]?.onSellCountChange} />
  },

  {
    accessorKey: 'cid',
    header: '平均价格',
    id: '平均价格',
    cell: ({ cell }) => <AvgTotalPrice value={relatedData.value[cell.row.original.cid]?.avgPrice}
      change={relatedData.value[cell.row.original.cid]?.avgPriceChange} unit="元/月" />

  },
  {
    accessorKey: 'cid',
    header: '近期涨价↗',
    id: '近期涨价',
    accessorFn: (originalRow, index) => {
      return relatedData.value[originalRow.cid]?.priceUpCount
    },
    cell: ({ cell }) => <div class='text-red-500 font-bold'>{cell.getValue()}</div>
  },
  {
    accessorKey: 'cid',
    header: '近期降价↘',
    id: '近期降价',
    accessorFn: (originalRow, index) => {
      return relatedData.value[originalRow.cid]?.priceDownCount
    },
    cell: ({ cell }) => <div class='text-green-500 font-bold'>{cell.getValue()}</div>
  },
  {
    accessorKey: 'cid',
    header: '近期上架🆕',
    id: '近期上架',
    accessorFn: (originalRow, index) => {
      return relatedData.value[originalRow.cid]?.addedCount
    },
    cell: ({ cell }) => <div class='text-blue-500 font-bold'>{cell.getValue()}</div>
  },
  {
    accessorKey: 'cid',
    header: '近期下架➖',
    id: '近期下架',
    accessorFn: (originalRow, index) => {
      return relatedData.value[originalRow.cid]?.removedCount
    },
    cell: ({ cell }) => <div class='text-neutral-500 font-bold'>{cell.getValue()}</div>
  },
  { accessorKey: 'runningCount', header: '运行次数', id: '运行次数' },
  {
    accessorKey: 'createdAt',
    header: '创建时间',
    id: '创建时间',
    cell: ({ cell }) => <TwoLineAt at={cell.getValue() as number} />
  },
  {
    accessorKey: 'lastRunningAt',
    header: '最后运行时间',
    id: '最后运行时间',
    cell: ({ cell }) => <TwoLineAt at={cell.getValue() as number} />
  },
]
/*
column END
 */

/*
table BEGIN
 */
let options: TableOptions<RentCommunityTask> = {
  get data() {
    return data.value
  },
  get columns() {
    return columnDef
  },
  getCoreRowModel: getCoreRowModel(),
  // getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),


  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get pagination() {
      return pagination.value
    },

  },
  // autoResetPageIndex:false,
  manualPagination: true,
  // pageCount:30,
  rowCount: 0,

  onPaginationChange: updaterOrValue => {
    valueUpdater(updaterOrValue, pagination)
    onPaginationUpdate(pagination.value.pageIndex, pagination.value.pageSize)

  }
}
const table = useVueTable(options)

/*
table END
 */

/**更新分页*/
async function onPaginationUpdate(pageIndex: number, pageSize: number) {
  localStorage.setItem('rent-community-list-page-size', String(pageSize))
  await pushQuery('_pageIndex', pageIndex)
  await pushQuery('_pageSize', pageSize)
  await queryData(pageIndex, pageSize)
}

/**
 * 如果变更了查询条件导致当前页码没有数据, 那么重置pageIndex
 */
async function resetPaginationIfNoData() {
  if (pagination.value.pageIndex !== 1 && data.value.length === 0) {
    pagination.value.pageIndex = 1
    await pushQuery('_pageIndex', 1)
    await queryData(1)
  }
}

/**更新查询条件*/
async function onQueryConditionUpdate() {
  await removeQueryConditionQueryParam()
  const condition = queryCondition.value
  await pushQueries(condition)

  // queryCache.del('pageIndex') //重置pageIndex
  // await removeQuery('_pageIndex')
  await queryData()
}


async function removeQueryConditionQueryParam() {
  await removeQueries(Object.keys(communityQueryConditionTemplate))
}

async function goRunTasks() {
  const communityList = Object.keys(rowSelection.value).map(s => toInt(s)).map(i => toRaw(data.value[i]))
  goRunRentCommunityTasksStartPage(communityList)
}

async function deleteSelectedTasks() {
  const ids = Object.keys(rowSelection.value).map(s => Number(s)).map(index => data.value[index].cid)
  await KeRentDao().deleteTasks(ids)
  alert(`删除成功!${ids.length}个任务`)
  rowSelection.value = {}
  data.value = data.value.filter(item => !ids.includes(item.cid))
}


onMounted(() => {
  queryData(pagination.value.pageIndex, pagination.value.pageSize)
})

</script>

<template>
  <h1 class="text-3xl font-extrabold text-center my-4 text-blue-500">租房小区任务</h1>

  <div class="relative flex  flex-col p-2 rounded border">
    <h2 class="text-2xl font-bold">查询条件</h2>
    <LoadingOverlay v-if="isPending" />
    <RentCommunityQueryDock v-if="queryCondition" v-model="queryCondition" @update="onQueryConditionUpdate" />
  </div>

  <div class="relative mb-5 mt-2 rounded p-2 border">
    排序:
    <GenericSortDock v-model="sortCondition" :fields="['city', 'cid', 'createdAt', 'runningCount', 'lastRunningAt']"
      :field-text-map="frequentFieldZhMap" @update="onQueryConditionUpdate" />
    <LoadingOverlay v-if="isPending" disable-anim />
  </div>


  <div class="relative flex items-center p-1 my-2 gap-4">
    <div> 共 <span class="text-primary">{{ rowCount }}</span> 条</div>
    <div> 查询耗时: <span class="text-primary">{{ queryCost / 1000 }}</span> 秒</div>
    <div v-if="selectionCount">选中 <span class="text-primary">{{ selectionCount }}</span> 条</div>
    <ConfirmDialog @confirm="goRunTasks()">
      <template #trigger>
        <Button class="p-1 h-fit" :disabled="!selectionCount">运行任务(选中)</Button>
      </template>
      开始运行 {{ selectionCount }} 个任务?
    </ConfirmDialog>

    <ConfirmDialog @confirm="deleteSelectedTasks">
      <template #trigger>
        <Button variant="destructive" class="p-1 h-fit" :disabled="!selectionCount">删除(选中)</Button>
      </template>
      <span class="text-red-700 font-bold">
        确认要删除选中的 {{ selectionCount }} 个任务吗?
      </span>
    </ConfirmDialog>

    <LoadingOverlay v-if="isPending" disable-anim />
  </div>


  <div class="flex" v-if="isDebug">
    <h1 class="p-1 m-1 border rounded">DEBUG:</h1>
    <div> {{ queryCondition }}</div>
    <div> {{ sortCondition }}</div>
  </div>

  <ColumnVisibleOption :columns="table.getAllColumns()" />

  <div class=" overflow-x-auto text-nowrap">
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()">
          <TableHead v-for="header in headerGroup.headers">
            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
              :props="header.getContext()" />
          </TableHead>

        </TableRow>

      </TableHeader>
      <TableBody>
        <TableRow v-for="row in table.getRowModel().rows" :key="row.id">
          <TableCell v-for="cell in row.getVisibleCells()">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </div>

  <div class="relative">
    <PaginationComponent :set-page-index="table.setPageIndex" :set-page-size="table.setPageSize"
      :pagination="pagination" :row-count="rowCount" />
    <LoadingOverlay v-if="isPending" disable-anim />

  </div>


</template>

<style scoped></style>
