<script setup lang="ts">
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
  SortingState,
  TableOptions,
  useVueTable,
  VisibilityState,
} from '@tanstack/vue-table'
import {db} from "@/utils/client/Dexie";
import {CommunityTask, HouseChange, HouseTask} from "@/types/lj";
import ColumnFilterCheckbox from "@/entrypoints/options/components/ColumnFilterCheckbox.vue";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import {valueUpdater} from "@/utils/shadcn-utils";
import {calcOffset, PageState} from "@/utils/table-utils";


type HouseChangeWithDetail = HouseChange & HouseTask & CommunityTask & {
  houseName?: string,
  communityName?: string
}
/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = useLocalStorage<VisibilityState>('house-changes-column-visibility', {})
const rowSelection = ref({})
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
const data = ref<HouseChangeWithDetail[]>([])

async function queryData() {
  const results: HouseChangeWithDetail[] = []
  //changes
  const changes = await db.houseChanges.offset(calcOffset(pagination.value.pageIndex, pagination.value.pageSize)).limit(pagination.value.pageSize).toArray()
  options.rowCount = await db.houseChanges.count()
  //houses info
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i]
    //todo 缓存
    const house = await db.houseTasks.where('hid').equals(change.hid).first()
    const community = await db.communityTasks.where('cid').equals(change.cid).first()

    results.push({
      ...house,
      ...community,
      ...change,
      houseName: house?.name,
      communityName: community?.name,
    })
  }

  //communities info
  data.value = results


}

/*
data END
 */

/*
column BEGIN
 */
const columnHelper = createColumnHelper<HouseChangeWithDetail>()
const columnDef: (ColumnDef<HouseChangeWithDetail> | AccessorKeyColumnDef<HouseChangeWithDetail, any>)[] = [
  columnHelper.accessor('id', {}),

  {
    accessorKey: 'cid',
    id: 'cid',
    header: 'cid header',
    cell: ({cell}) => h('a', {href: '#' + cell.getValue()}, cell.getValue() as string)
  } as ColumnDef<HouseChangeWithDetail>,
  columnHelper.accessor('hid', {
    header: 'id',
    cell: ({cell}) => h('a', {'class': 'text-green-500', 'href':'#/h/task/detail?id='+cell.getValue()}, cell.getValue())
  }) as ColumnDef<HouseChangeWithDetail>,
  columnHelper.accessor('oldValue', {}),
  columnHelper.accessor('newValue', {}),
  columnHelper.accessor('houseName', {}),
  columnHelper.accessor('communityName', {}),
  columnHelper.accessor('city', {}),
  columnHelper.accessor('area', {}),
  columnHelper.accessor('realArea', {}),
  columnHelper.accessor('at', {
    cell: ({cell}) => new Date(cell.getValue()).toLocaleString()
  }),


]
/*
column END
 */


/*
table BEGIN
 */
let options: TableOptions<HouseChangeWithDetail> = {
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


</script>

<template>
  <h1>H Changes</h1>
  <ColumnFilterCheckbox :table="table" v-model:visibility="columnVisibility"/>
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
      :max-page="table.getPageCount()"/>
  {{ pagination }}


</template>

<style scoped>

</style>