<script setup lang="tsx">
//
import TwoLineAt from "@/components/lj/column/TwoLineAt.vue";
import ValueChangeBudget from "@/components/lj/house/ValueChangeBudget.vue";
import ColumnVisibleOption from "@/components/table/ColumnVisibleOption.vue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import { RentCommunityRecord } from "@/types/rent";
import { tryMinusOrUndefined } from "@/utils/operator";
import { valueUpdater } from "@/utils/shadcn-utils";
import { RentCommunityRecordUrl } from "@/utils/url-component";
import {
  CellContext,
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
  VisibilityState
} from '@tanstack/vue-table';
import { useLocalStorage } from "@vueuse/core";
import { computed, onMounted, ref, watch, } from "vue";

/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = useLocalStorage<VisibilityState>('column-visibility-community-record', {})
const rowSelection = ref({})

type DATA_TYPE = RentCommunityRecord
type RENDER_DATA_TYPE = Record<keyof DATA_TYPE, ValueDiff>
const { data, rowCount } = defineProps<{
  data: DATA_TYPE[],
  rowCount: number
}>()

type ValueDiff = { value: any, diff?: number }

const renderData = computed(() => {
  const result: RENDER_DATA_TYPE[] = []
  let lastData: DATA_TYPE | undefined = undefined
  for (let i = data.length - 1; i >= 0; i--) {
    const obj: Partial<RENDER_DATA_TYPE> = {}
    const curData = data[i]
    const {
      id,
      at,
      avgPrice,
      count,
      priceDownList,
      priceUpList,
      removed,
      added,
      list
    } = curData
    obj.id = { value: id }
    obj.at = { value: at }
    obj.avgPrice = { value: avgPrice }
    obj.count = { value: count }
    obj.priceDownList = { value: priceDownList.length }
    obj.priceUpList = { value: priceUpList.length }
    obj.removed = { value: removed?.length }
    obj.added = { value: added.length }
    obj.list = { value: list.length }
    if (lastData) {
      obj.avgPrice.diff = tryMinusOrUndefined(avgPrice, lastData.avgPrice)
      obj.count.diff = tryMinusOrUndefined(count, lastData.count)
      obj.priceUpList.diff = tryMinusOrUndefined(priceUpList.length, lastData.priceUpList.length)
      obj.priceDownList.diff = tryMinusOrUndefined(priceDownList.length, lastData.priceDownList.length)
      obj.removed.diff = tryMinusOrUndefined(removed.length, lastData.removed.length)
      obj.added.diff = tryMinusOrUndefined(added.length, lastData.added.length)
      obj.list.diff = tryMinusOrUndefined(list.length, lastData.list.length)
    }
    result.push(obj as RENDER_DATA_TYPE)
    lastData = data[i]
  }
  return result.reverse()
})
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
const pagination = ref({ pageIndex: 1, pageSize: 10 })

//初始化默认查询
emit('onPaginationChange', pagination.value.pageIndex, pagination.value.pageSize)
/**
 * pagination end
 */


const cellRenderWithValueChange = ({ cell }: CellContext<RENDER_DATA_TYPE, any>) => {
  const { value, diff } = cell.getValue()
  if (value === undefined) return '-'
  if (diff) {
    return <div class="flex items-center flex-nowrap">{value} <ValueChangeBudget type="number" value={diff} /></div>
  }
  return `${value}`
}


/*
column BEGIN
 */


const columnDef: (ColumnDef<RENDER_DATA_TYPE, ValueDiff>)[] = [
  {
    accessorKey: 'id', header: 'id', id: 'id',
    cell: ({ cell }) => RentCommunityRecordUrl(cell.getValue()?.value)
  },
  {
    accessorKey: 'at', header: '运行时间', id: '运行时间',
    cell: ({ cell }) => <TwoLineAt at={cell.getValue()?.value} />
  },
  {
    accessorKey: 'count', header: '在租数量', id: '在租数量',
    cell: cellRenderWithValueChange
  },
  {
    accessorKey: 'avgPrice', header: '平均总价', id: '平均总价',
    cell: cellRenderWithValueChange
  },
  {
    accessorKey: 'priceUpList', header: '涨价数', id: '涨价数',
    cell: cellRenderWithValueChange
  },
  {
    accessorKey: 'priceDownList', header: '降价数', id: '降价数',
    cell: cellRenderWithValueChange
  },
  {
    accessorKey: 'added', header: '新增上架', id: '新增上架',
    cell: cellRenderWithValueChange
  },
  {
    accessorKey: 'removed', header: '新增下架', id: '新增下架',
    cell: cellRenderWithValueChange
  },
]
/*
column END
 */


/*
table BEGIN
 */
let options: TableOptions<RENDER_DATA_TYPE> = {
  get data() {
    return renderData.value
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
    emit('onPaginationChange', pagination.value.pageIndex, pagination.value.pageSize)
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
  <ColumnVisibleOption :columns="table.getAllColumns()" />
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
      <template v-for="(row, rowIndex) in table.getRowModel().rows">
        <TableRow class="border-b">
          <TableCell v-for="cell in row.getVisibleCells()">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </TableCell>

        </TableRow>
      </template>

    </TableBody>
  </Table>

  <PaginationComponent :set-page-index="table.setPageIndex" :set-page-size="table.setPageSize" :pagination="pagination"
    :row-count="table.getRowCount()" />


</template>

<style scoped></style>