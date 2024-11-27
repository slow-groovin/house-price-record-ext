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
import {CommunityRecord} from "@/types/lj";
import ColumnFilterCheckbox from "@/entrypoints/options/components/ColumnFilterCheckbox.vue";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import {valueUpdater} from "@/utils/shadcn-utils";
import {h, onMounted, ref, watch,} from "vue";
import {useLocalStorage} from "@vueuse/core";

/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = useLocalStorage<VisibilityState>('column-visibility-community-record', {})
const rowSelection = ref({})

type DATA_TYPE=CommunityRecord
const {data, rowCount} = defineProps<{
  data: DATA_TYPE[],
  rowCount: number
}>()
/*
ref definition DONE
 */


/**
 * pagination
 */
const emit = defineEmits<{
  (e: 'onPaginationChange', pageIndex: number, pageSize: number): void
}>()
// const pagination = defineModel<PageState>('pagination')
const pagination = ref( {pageIndex: 1, pageSize: 10})

//初始化默认查询
emit('onPaginationChange',pagination.value.pageIndex,pagination.value.pageSize)
/**
 * pagination end
 */



/*
column BEGIN
 */
const columnHelper = createColumnHelper<DATA_TYPE>()

const columnDef: (ColumnDef<DATA_TYPE> | AccessorKeyColumnDef<DATA_TYPE, any>)[] = [
  columnHelper.accessor('id', {}),

  {
    accessorKey: 'cid',
    id: 'cid',
    header: 'cid header',
    cell: ({cell}) => h('a', {href: '#/c/task/detail?id=' + cell.getValue(),target:'_blank'}, cell.getValue() as string)
  } as ColumnDef<DATA_TYPE>,
  columnHelper.accessor('avgTotalPrice', {}),
  columnHelper.accessor('avgUnitPrice', {}),
  columnHelper.accessor('onSellCount', {}),
  columnHelper.accessor('visitCountIn90Days', {}),
  columnHelper.accessor('doneCountIn90Days', {}),
  columnHelper.accessor('maxPageNo', {}),
  columnHelper.accessor('at', {
    cell: ({cell}) => new Date(cell.getValue()).toLocaleString()
  }),


  columnHelper.accessor('addedItem', {
    cell: ({cell})=> cell.getValue()?.length
  }),
  columnHelper.accessor('removedItem', {
    cell: ({cell})=> cell.getValue()?.length
  }),
  columnHelper.accessor('priceUpList', {
    cell: ({cell})=> cell.getValue()?.length
  }),
  columnHelper.accessor('priceDownList', {
    cell: ({cell})=> cell.getValue()?.length
  }),
]
/*
column END
 */


/*
table BEGIN
 */
let options: TableOptions<DATA_TYPE> = {
  get data() {
    return data
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
  rowCount: rowCount,

  onPaginationChange: updaterOrValue => {
    // console.log('updaterOrValue',updaterOrValue ,'before:',pagination.value)
    valueUpdater(updaterOrValue, pagination)
    // console.log('after:',pagination.value)
    emit('onPaginationChange',pagination.value.pageIndex, pagination.value.pageSize)
  }
}
const table = useVueTable(options)
/*
table END
 */


onMounted(() => {

  watch(() => rowCount, () => {
    // console.log('rowCount changed.')
    options.rowCount = rowCount

  })
})


</script>

<template>
<!--  todo table->timeline -->
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
    :row-count="table.getRowCount()"/>


</template>

<style scoped>

</style>