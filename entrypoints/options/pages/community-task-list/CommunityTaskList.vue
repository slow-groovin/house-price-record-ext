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
import ColumnFilterCheckbox from "@/entrypoints/options/components/ColumnFilterCheckbox.vue";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import {valueUpdater} from "@/utils/shadcn-utils";
import {calcOffset, PageState} from "@/utils/table-utils";
import {h, onMounted, ref, toRaw} from "vue";
import {useLocalStorage} from "@vueuse/core";
import {Button} from "@/components/ui/button";
import {toInt} from "radash";
import {browser} from "wxt/browser";
import {startPageEntry} from "@/entrypoints/reuse/community-control2";


/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = useLocalStorage<VisibilityState>('community-list-column-visibility', {})
const rowSelection = ref<RowSelectionState>({})

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

/**
 * pagination end
 */

/*
data
 */
const data = ref<CommunityTask[]>([])
const rowCount = ref(0)

async function queryData() {
  //changes
  const tasks = await db.communityTasks.offset(calcOffset(pagination.value.pageIndex, pagination.value.pageSize)).limit(pagination.value.pageSize).toArray()
  rowCount.value = await db.communityTasks.count()
  //communities info
  data.value = tasks


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
  columnHelper.accessor('runningCount', {}),
  columnHelper.accessor('visitCountIn90Days', {}),
  columnHelper.accessor('doneCountIn90Days', {}),
  columnHelper.accessor('avgUnitPrice', {}),
  columnHelper.accessor('status', {}),
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
    console.log(toRaw(pagination.value))
    queryData()

  }
}
const table = useVueTable(options)
/*
table END
 */


onMounted(() => {
  queryData()
})

async function beginCrawlCommunities(){
  const communityList= Object.keys(rowSelection.value).map(s=>toInt(s)).map(i=>toRaw(data.value[i]))
  startPageEntry(communityList)
}

</script>

<template>
  <h1>Community tasks</h1>
  <ColumnFilterCheckbox :table="table" v-model:visibility="columnVisibility"/>
  <div>{{Object.keys( rowSelection)}}</div>
  <div>
    <Button @click="beginCrawlCommunities()">beginCrawls()</Button>
  </div>
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

  <PaginationComponent
    :set-page-index="table.setPageIndex"
    :set-page-size="table.setPageSize"
    :pagination="pagination"
    :row-count="rowCount"/>


</template>

<style scoped>

</style>