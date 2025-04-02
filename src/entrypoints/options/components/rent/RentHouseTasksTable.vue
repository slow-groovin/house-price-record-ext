<script setup lang="tsx">
//
import ColumnVisibleOption from "@/components/table/ColumnVisibleOption.vue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KeRentDao, RentDao } from "@/entrypoints/db/rent-dao";
import StatusDesc from "@/entrypoints/options/components/description/StatusDesc.vue";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import { HStatusColor } from "@/entrypoints/reuse/enum-corespond";
import { RentCommunityTask, RentHouse, RentHousePriceChange } from "@/types/rent";
import { formatDistanceToNowHoursOrDays } from "@/utils/date";
import { genKeRentHousePageUrl } from "@/utils/lj-url";
import { tryGreaterThanOrFalse, tryLessThanOrFalse } from "@/utils/operator";
import { cn, valueUpdater } from "@/utils/shadcn-utils";
import { tryMax, tryMin } from "@/utils/variable";
import { Icon } from '@iconify/vue';
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
import { boil, group } from "radash";
import { HTMLAttributes, onMounted, ref, watch, Component } from "vue";
import PriceWithTime from "./PriceWithTime.vue";
import { RentHouseDetailUrl } from "@/utils/url-component";


type RelatedData = {
  priceInit?: number,
  priceMax?: { value: number, at?: number },
  priceMin?: { value: number, at?: number },
  priceChangeCount?: number,
  priceLastChange?: { value: number, at: number }
}
const { data, rowCount, initPageSize, initPageIndex, class: _class } = defineProps<{
  data: RentHouse[],
  initPageIndex?: number,
  initPageSize?: number,
  rowCount: number
  class?: HTMLAttributes['class'],
}>()
const rowSelection = defineModel<RowSelectionState>('rowSelection')

const emit = defineEmits<{
  (e: 'onPaginationChange', pageIndex: number, pageSize: number): void
}>()
/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = useLocalStorage<VisibilityState>('house-tasks-column-visibility', { '初始价格': false, '上次价格': false, '最高价': false, '最低价': false })
const relatedCommunity = ref(new Map<string, RentCommunityTask>())
const relatedData = ref(new Map<string, RelatedData>())
const priceRelatedShowType = ref<undefined | 'last' | 'max' | 'min' | 'init' | 'count'>()
/*
ref definition DONE
 */


/**
 * pagination
 */

// const pagination = defineModel<PageState>('pagination')
const pagination = ref({ pageIndex: initPageIndex ?? 1, pageSize: initPageSize ?? 10 })
console.log('RentHouseTaskTable.vue init.', pagination.value)
//初始化默认查询
emit('onPaginationChange', pagination.value.pageIndex, pagination.value.pageSize)
/**
 * pagination end
 */



/*
column BEGIN
 */
const columnHelper = createColumnHelper<RentHouse>()
const columnDef: (ColumnDef<RentHouse>)[] = [
  {
    id: 'select',
    header: ({ table }: { table: any }) => {
      return (
        <input type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        ></input>
      )
    },
    cell: ({ row }: { row: any }) => {
      return (
        <div class="px-1">
          <input type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          ></input>
        </div>
      )
    },
  },

  {
    accessorKey: 'cid',
    id: '小区',
    header: '小区',
    cell: ({ cell }) =>
      <div class="text-xs">
        <div class="flex">
          <a href={"#/rent/c/task/detail?id=" + cell.getValue()} class="link " target="_blank">
            <div>{cell.getValue()}</div>
          </a> &nbsp;&nbsp;&nbsp;
        </div>
        <div>{relatedCommunity.value.get(cell.getValue() as string)?.name}</div>
      </div>

    // h('a', {href: '#/c/task/detail?id=' + cell.getValue()}, cell.getValue() as string)
  } as ColumnDef<RentHouse>,
  {
    accessorKey: 'name',
    header: '名称',
    id: '名称',
    accessorFn(originalRow: RentHouse, index: number) {
      return { name: originalRow.name, rid: originalRow.rid, city: relatedCommunity.value.get(originalRow.cid)?.city };
    },
    cell: ({ cell }) => {
      const { name, rid, city } = cell.getValue() as { name?: string, rid?: string, city?: string }
      return <div class="text-xs">
        {RentHouseDetailUrl(rid)}

        <div class="text-nowrap flex flex-nowrap">
          {name}
          <a class="inline-block link text-base hover:bg-gray-200" href={genKeRentHousePageUrl(city!, rid!)} target="_blank"
            rel="noreferrer">
            <Icon icon="tdesign:jump" />
          </a>
        </div>
      </div>
    }
  },

  {
    accessorKey: "price",
    header: '价格(元/月)',
    id: '价格',
    cell: ({ cell, row }) => cell.getValue() + ''
  },
  {
    accessorKey: "price", header: '单价(元/月/㎡)', id: '单价',
    accessorFn(originalRow: RentHouse, index: number) {
      return originalRow.area ? (originalRow.price / originalRow.area).toFixed(0) : '-';
    },
    cell: ({ cell, }) => cell.getValue()
  },
  {
    accessorKey: 'rid',
    header: '初始价格',
    id: '初始价格',
    cell: ({ cell, row }) => <PriceWithTime relatedData={relatedData.value.get(row.original.rid)} type="init" price={row.original.price} />
  },
  {
    accessorKey: 'rid',
    header: '上次价格',
    id: '上次价格',
    cell: ({ cell, row }) => <PriceWithTime relatedData={relatedData.value.get(cell.getValue() as string)} type="last" price={row.original.price} />
  },
  {
    accessorKey: 'rid',
    header: '最低价',
    id: '最低价',
    cell: ({ cell, row }) => <PriceWithTime relatedData={relatedData.value.get(cell.getValue() as string)} type="min" price={row.original.price} />
  },
  {
    accessorKey: 'rid',
    header: '最高价',
    id: '最高价',
    cell: ({ cell, row }) => <PriceWithTime relatedData={relatedData.value.get(cell.getValue() as string)} type="max" price={row.original.price} />
  },
  {
    accessorKey: 'rid',
    header: '价格变更次数',
    id: '价格变更次数',
    cell: ({ cell, }) => relatedData.value.get(cell.getValue() as string)?.priceChangeCount
  },


  {
    accessorKey: "desc",
    header: '简介',
    id: '简介',
    cell: ({ cell, row }) => cell.getValue()
  },

  {
    accessorKey: "createdAt",
    header: '任务创建',
    id: '任务创建',
    cell: ({ cell }) => {
      if (!cell.getValue()) return '-'
      return <div class="text-xs text-neutral-600">
        <div class=" text-blue-400">{formatDistanceToNowHoursOrDays(cell.getValue())}</div>
        <div>{new Date(cell.getValue() as string).toLocaleString()}</div>
      </div>
    }
  },

  {
    accessorKey: "lastRunningAt",
    header: '最后更新',
    id: '最后更新',
    cell: ({ cell }) => {
      if (!cell.getValue()) return '-'
      return <div class="text-xs">
        <div class=" text-green-400">{formatDistanceToNowHoursOrDays(cell.getValue())}</div>
        <div>{new Date(cell.getValue() as string).toLocaleString()}</div>
      </div>
    }
  },
  {
    accessorKey: 'releasedAt',
    header: '上架/维护时间',
    id: '上架/维护时间',
    cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue() as string).toLocaleDateString() : '-'
  },



]
/*
column END
 */


/*
table BEGIN
 */
let options: TableOptions<RentHouse> = {
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
  enableRowSelection: true, //enable row selection for all rows
  // autoResetPageIndex:false,
  manualPagination: true,
  // pageCount:30,
  rowCount: rowCount,

  onPaginationChange: updaterOrValue => {
    // console.log('updaterOrValue',updaterOrValue ,'before:',pagination.value)
    valueUpdater(updaterOrValue, pagination)
    emit('onPaginationChange', pagination.value.pageIndex, pagination.value.pageSize)
  }
}
const table = useVueTable(options)

/*
table END
 */

/**
 * 查询每一项相关数据
 */
async function queryRelatedData() {
  //query related community
  const cidList = data.map(t => t.cid);
  (await RentDao.from('ke').findCommunitiesByCids(cidList))
    .forEach((c) => {
      relatedCommunity.value.set(c.cid, c)
    })
  //query and calc changes
  const ridList = data.map(t => t.rid)

  const changes = await KeRentDao().findChangesByRidsAndType(ridList, 'price')
  const changesGroup = group(changes, t => t.rid)
  for (let changesGroupKey in changesGroup) {
    const changes = changesGroup[changesGroupKey]
    if (changes && changes?.length > 0 && changesGroup[changesGroupKey]) {
      relatedData.value.set(changesGroupKey, getRelatedDataFromChanges(changesGroup[changesGroupKey]))
    }
  }
}

/**
 * 从changes记录中计算价格相关数据
 */
function getRelatedDataFromChanges(changes: RentHousePriceChange[]) {
  const sortedChanges = changes.sort((a, b) => a.at - b.at)
  const lastChange = sortedChanges[sortedChanges.length - 1]
  const minOldValue = boil(changes, (a, b) => (a.oldValue < b.oldValue) ? a : b)
  const maxOldValue = boil(changes, (a, b) => (a.oldValue > b.oldValue) ? a : b)
  const minNewValue = boil(changes, (a, b) => (a.newValue < b.newValue) ? a : b)
  const maxNewValue = boil(changes, (a, b) => (a.newValue > b.newValue) ? a : b)
  const minPrice = tryMin(minOldValue?.oldValue, minNewValue?.newValue)
  const maxPrice = tryMax(maxOldValue?.oldValue, maxNewValue?.newValue)
  const minAt = tryLessThanOrFalse(minOldValue?.oldValue, minNewValue?.newValue) ? undefined : minNewValue?.at
  const maxAt = tryGreaterThanOrFalse(maxOldValue?.oldValue, maxNewValue?.newValue) ? undefined : maxNewValue?.at
  const r: RelatedData = {
    priceChangeCount: sortedChanges.length,
    priceInit: sortedChanges[0].oldValue,
    priceLastChange: { at: lastChange.at, value: lastChange.oldValue },
  }
  if (minPrice) {
    r.priceMin = { at: minAt, value: minPrice }
  }
  if (maxPrice) {
    r.priceMax = { at: maxAt, value: maxPrice }
  }
  return r
}


onMounted(() => {

  watch(() => rowCount, () => {
    console.log('rowCount changed.')
    options.rowCount = rowCount
  })
  watch(() => data, () => {
    //query related community
    queryRelatedData()
  })
})


</script>

<template>
  <div :class="cn(_class)">
    <div class="flex gap-2 items-center">
      <StatusDesc />
      <ColumnVisibleOption :columns="table.getAllColumns()" />
      <div class="flex">
      </div>
    </div>
    <Table class="w-fit overflow-scroll text-nowrap">
      <TableHeader class="border-l-8">
        <TableRow v-for="headerGroup in table.getHeaderGroups()">
          <TableHead v-for="header in headerGroup.headers">
            <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
              :props="header.getContext()" />
          </TableHead>

        </TableRow>

      </TableHeader>
      <TableBody>
        <TableRow v-for="(row, index) in table.getRowModel().rows" class="border-l-8 rounded-l-2xl"
          :class="cn('hover:bg-' + HStatusColor[data[index].status] + '/20', 'border-l-' + HStatusColor[data[index].status],)">
          <TableCell v-for="cell in row.getVisibleCells()">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <PaginationComponent :set-page-index="table.setPageIndex" :set-page-size="table.setPageSize"
      :pagination="pagination" :row-count="table.getRowCount()" />

  </div>
</template>

<style scoped></style>