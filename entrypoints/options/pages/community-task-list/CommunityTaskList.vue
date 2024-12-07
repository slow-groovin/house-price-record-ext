<script setup lang="tsx">
//
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
  AccessorKeyColumnDef,
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
} from '@tanstack/vue-table'
import {db} from "@/utils/client/Dexie";
import {CommunityTask} from "@/types/lj";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import {valueUpdater} from "@/utils/shadcn-utils";
import {calcOffset, PageState} from "@/utils/table-utils";
import {h, onMounted, ref, toRaw} from "vue";
import {useLocalStorage} from "@vueuse/core";
import {Button} from "@/components/ui/button";
import {toInt} from "radash";
import {startPageEntry} from "@/entrypoints/reuse/community-control2";
import CommunityQueryDock from "@/entrypoints/options/components/CommunityQueryDock.vue";
import {CommunityQueryCondition, SortState} from "@/types/query-condition";
import ColumnVisibleOption from "@/components/table/ColumnVisibleOption.vue";
import {ArgCache} from "@/utils/lib/ArgCache";
import {Collection, InsertType} from "dexie";
import {tryGreaterThanOrFalse, tryLessThanOrFalse} from "@/utils/operator";
import HouseTaskSortDock from "@/entrypoints/options/components/HouseTaskSortDock.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";


/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = useLocalStorage<VisibilityState>('community-list-column-visibility', {})
const rowSelection = ref<RowSelectionState>({})

const queryCondition = ref<CommunityQueryCondition>({})
const sortCondition = ref<SortState<CommunityTask>>({})

const queryCost = ref(0)
const isPending = ref(false)

/*
ref definition DONE
 */


/**
 * pagination
 */

const pagination = ref<PageState>({
  pageSize: 10,
  pageIndex: 1,
})
const argCache = new ArgCache()
/**
 * pagination end
 */

/*
data
 */
const data = ref<CommunityTask[]>([])
const rowCount = ref(0)

async function queryData(_pageIndex?: number, _pageSize?: number) {
  const pageIndex = argCache.retrieve('pageIndex', _pageIndex, 1)
  const pageSize = argCache.retrieve('pageSize', _pageSize, 10)
  const beginAt = Date.now()
  isPending.value = true

  let query: Collection<CommunityTask, number | undefined, InsertType<CommunityTask, "id">>

  /**
   * index match
   */
  const {
    cidInclude, nameInclude, city, lastRunningAtMax, lastRunningAtMin, createdAtMin, createdAtMax, avgTotalPriceMax,
    avgTotalPriceMin, avgUnitPriceMax, avgUnitPriceMin, onSellCountMin, onSellCountMax
  } = queryCondition.value
  const {field, order} = sortCondition.value

  if (order && field) {
    query = db.communityTasks.orderBy(field)
  } else if (lastRunningAtMin || lastRunningAtMax) {
    if (lastRunningAtMin && lastRunningAtMax) {
      query = db.communityTasks.where('lastRunningAt').between(new Date(lastRunningAtMin).getTime(), new Date(lastRunningAtMax).getTime(), true, true)
    } else if (lastRunningAtMin) {
      query = db.communityTasks.where('lastRunningAt').aboveOrEqual(new Date(lastRunningAtMin).getTime())
    } else {
      query = db.communityTasks.where('lastRunningAt').belowOrEqual(new Date(lastRunningAtMax!).getTime())
    }
  } else if (city) {
    query = db.communityTasks.where('city').equals(city)
  } else {
    query = db.communityTasks.toCollection()
  }


  /**
   * filter
   */
  const filters: ((item: CommunityTask) => boolean)[] = []
  if (cidInclude) filters.push(item => item.cid.includes(cidInclude))
  if (nameInclude) filters.push(item => item.name?.includes(nameInclude) ?? false)
  if (city) filters.push(item => item.city?.includes(city) ?? false)
  if (lastRunningAtMax) filters.push(item => item.lastRunningAt <= new Date(lastRunningAtMax).getTime())
  if (lastRunningAtMin) filters.push(item => item.lastRunningAt >= new Date(lastRunningAtMin).getTime())
  if (createdAtMax) filters.push(item => item.createdAt <= new Date(createdAtMax).getTime())
  if (createdAtMin) filters.push(item => item.createdAt >= new Date(createdAtMin).getTime())
  if (avgTotalPriceMax) filters.push(item => tryLessThanOrFalse(item?.avgTotalPrice, avgTotalPriceMax))
  if (avgTotalPriceMin) filters.push(item => tryGreaterThanOrFalse(item?.avgTotalPrice, avgTotalPriceMin))
  if (avgUnitPriceMax) filters.push(item => tryLessThanOrFalse(item?.avgUnitPrice, avgUnitPriceMax))
  if (avgUnitPriceMin) filters.push(item => tryGreaterThanOrFalse(item?.avgUnitPrice, avgUnitPriceMin))
  if (onSellCountMax) filters.push(item => tryLessThanOrFalse(item?.onSellCount, onSellCountMax))
  if (onSellCountMin) filters.push(item => tryGreaterThanOrFalse(item?.onSellCount, onSellCountMin))

  //应用filter
  if (filters.length) {
    query = query.filter(item => filters.every(f => f(item)))
  }


  rowCount.value = await query.count()

  if (order !== 'asc') {
    query = query.reverse()
  }

  data.value = await query
    .offset(calcOffset(pageIndex, pageSize))
    .limit(pageSize)
    .toArray()

  queryCost.value = Date.now() - beginAt
  isPending.value = false
}

async function onApplyQueryCondition() {
  if (isPending.value) return
  argCache.del('pageIndex')
  queryData()
}

/*
data END
 */

/*
column BEGIN
 */
const columnHelper = createColumnHelper<CommunityTask>()
const columnDef: (ColumnDef<CommunityTask> | AccessorKeyColumnDef<CommunityTask, any>)[] = [
  {
    id: 'select',
    header: ({table}: { table: any }) => {
      return (
        <input type="checkbox"
               checked={table.getIsAllRowsSelected()}
               onChange={table.getToggleAllRowsSelectedHandler()}></input>
      )
    },
    cell: ({row}: { row: any }) => {
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
  columnHelper.accessor('id', {}),

  {
    accessorKey: 'cid',
    id: 'cid',
    header: 'cid header',
    cell: ({cell}) => h('a', {
      'class': 'text-green-500',
      'href': '#/c/task/detail?id=' + cell.getValue()
    }, cell.getValue() as string)
  } as ColumnDef<CommunityTask>,
  columnHelper.accessor('name', {}),
  columnHelper.accessor('city', {}),
  columnHelper.accessor('onSellCount', {}),

  columnHelper.accessor('avgTotalPrice', {}),
  columnHelper.accessor('avgUnitPrice', {}),
  // columnHelper.accessor('status', {}),
  columnHelper.accessor('runningCount', {}),
  columnHelper.accessor('visitCountIn90Days', {}),
  columnHelper.accessor('doneCountIn90Days', {}),
  columnHelper.accessor('createdAt', {
    cell: ({cell}) => new Date(cell.getValue()).toLocaleString()
  }),
  columnHelper.accessor('lastRunningAt', {
    cell: ({cell}) => new Date(cell.getValue()).toLocaleString()
  }),


]
/*
column END
 */


/*
table BEGIN
 */
let options: TableOptions<CommunityTask> = {
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
    queryData(pagination.value.pageIndex, pagination.value.pageSize)

  }
}
const table = useVueTable(options)
/*
table END
 */


onMounted(() => {
  queryData()
})

async function beginCrawlCommunities() {
  const communityList = Object.keys(rowSelection.value).map(s => toInt(s)).map(i => toRaw(data.value[i]))
  startPageEntry(communityList)
}

</script>

<template>
  <h1 class="text-3xl font-extrabold text-center my-4">小区任务</h1>

  <div class="relative flex  flex-col p-2 rounded border">
    <h2 class="text-2xl font-bold">查询条件</h2>
    <LoadingOverlay v-if="isPending"/>
    <CommunityQueryDock v-model="queryCondition" @update="onApplyQueryCondition"/>
  </div>

  <div class="relative mb-5 rounded p-2 border">
    排序:
    <HouseTaskSortDock v-model="sortCondition" :fields="['lastRunningAt','createdAt']" @update="onApplyQueryCondition"/>
    <LoadingOverlay v-if="isPending" disable-anim/>
  </div>


  <div class="relative flex items-center p-1 my-2 gap-4">
    <div> 共 {{ rowCount }} 条</div>
    <div> 查询耗时: {{ queryCost / 1000 }} 秒</div>
    <Button @click="beginCrawlCommunities()">beginCrawls()</Button>
    <div> {{ queryCondition }}</div>
    <div>{{ Object.keys(rowSelection) }}</div>

    <LoadingOverlay v-if="isPending" disable-anim/>
  </div>

  <ColumnVisibleOption :columns="table.getAllColumns()"/>

  <Table>
    <TableHeader>
      <TableRow v-for="headerGroup in table.getHeaderGroups()">
        <TableHead v-for="header in headerGroup.headers">
          <FlexRender
            v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
            :props="header.getContext()"
          />
        </TableHead>

      </TableRow>

    </TableHeader>
    <TableBody>
      <TableRow v-for="row in table.getRowModel().rows">
        <TableCell v-for="cell in row.getVisibleCells()">
          <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()"/>
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>


  <div class="relative">
    <PaginationComponent
      :set-page-index="table.setPageIndex"
      :set-page-size="table.setPageSize"
      :pagination="pagination"
      :row-count="rowCount"/>
    <LoadingOverlay v-if="isPending" disable-anim/>

  </div>


</template>

<style scoped>

</style>