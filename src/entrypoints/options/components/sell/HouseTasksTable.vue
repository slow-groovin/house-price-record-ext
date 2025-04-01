<script setup lang="tsx">
//
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
} from '@tanstack/vue-table'
import { CommunityTask, HouseChange, HouseTask } from "@/types/lj";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import { cn, valueUpdater } from "@/utils/shadcn-utils";
import { HTMLAttributes, onMounted, ref, watch } from "vue";
import { useLocalStorage } from "@vueuse/core";
import ColumnVisibleOption from "@/components/table/ColumnVisibleOption.vue";
import { db } from "@/entrypoints/db/Dexie";
import { Icon } from '@iconify/vue'
import { genHousePageUrl } from "@/utils/lj-url";
import RealAreaDesc from "@/entrypoints/options/components/description/RealAreaDesc.vue";
import { formatDistanceToNowHoursOrDays } from "@/utils/date";
import { HStatusColor } from "@/entrypoints/reuse/enum-corespond";
import StatusDesc from "@/entrypoints/options/components/description/StatusDesc.vue";
import { boil, group } from "radash";
import TotalPriceItem from "@/entrypoints/options/components/TotalPriceItem.vue";
import SelectButton from "@/components/custom/SelectButton.vue";
import { tryMax, tryMin } from "@/utils/variable";
import { tryGreaterThanOrFalse, tryLessThanOrFalse } from "@/utils/operator";
import HouseFieldsLackDesc from "../description/HouseFieldsLackDesc.vue";


type RelatedData = {
  priceInit?: number,
  priceMax?: { value: number, at?: number },
  priceMin?: { value: number, at?: number },
  priceChangeCount?: number,
  priceLastChange?: { value: number, at: number }
}
const { data, rowCount, initPageSize, initPageIndex, class: _class } = defineProps<{
  data: HouseTask[],
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
const columnVisibility = useLocalStorage<VisibilityState>('house-tasks-column-visibility', {})
const relatedCommunity = ref(new Map<string, CommunityTask>())
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
console.log('HouseTaskTable.vue init.', pagination.value)
//初始化默认查询
emit('onPaginationChange', pagination.value.pageIndex, pagination.value.pageSize)
/**
 * pagination end
 */



/*
column BEGIN
 */
const columnHelper = createColumnHelper<HouseTask>()
const columnDef: (ColumnDef<HouseTask>)[] = [
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
          <a href={"#/c/task/detail?id=" + cell.getValue()} class="link " target="_blank">
            <div>{cell.getValue()}</div>
          </a> &nbsp;&nbsp;&nbsp;
        </div>
        <div>{relatedCommunity.value.get(cell.getValue() as string)?.name}</div>
      </div>

    // h('a', {href: '#/c/task/detail?id=' + cell.getValue()}, cell.getValue() as string)
  } as ColumnDef<HouseTask>,
  {
    accessorKey: 'name',
    header: '名称',
    id: '名称',
    accessorFn(originalRow: HouseTask, index: number) {
      return { name: originalRow.name, hid: originalRow.hid, city: originalRow.city };
    },
    cell: ({ cell }) => {
      const { name, hid, city } = cell.getValue() as { name?: string, hid?: string, city?: string }
      return <div class="text-xs">
        <a href={"#/h/task/detail?id=" + hid} class="link" target="_blank">{hid}</a>
        <div class="text-nowrap flex flex-nowrap">
          {name}
          <a class="inline-block link text-base hover:bg-gray-200" href={genHousePageUrl(city!, hid!)} target="_blank"
            rel="noreferrer">
            <Icon icon="tdesign:jump" />
          </a>
        </div>
      </div>
    }
  },
  {
    accessorKey: 'area', header: '建筑面积', id: '建筑面积',
    cell: ({ cell }) => cell.getValue() + "㎡"
  },
  {
    accessorKey: 'realArea', id: '计算面积',
    header: () => {
      return <div class="flex items-center">计算面积<RealAreaDesc /></div>
    },
    cell: ({ cell, row }) => {
      const realArea = cell.getValue() as number
      if (!realArea) return '-'
      const area = Number(row.getValue('建筑面积'))
      return <div>
        {cell.getValue()}㎡ ({(realArea * 100 / area).toFixed(0)}%)
      </div>
    }
  },
  {
    accessorKey: "totalPrice",
    header: '总价',
    id: '总价',
    cell: ({ cell, row }) => <TotalPriceItem hid={row.original.hid}
      price={cell.getValue() as number}
      relatedData={relatedData.value.get(row.original.hid)}
      relatedType={priceRelatedShowType.value} />
  },
  {
    accessorKey: "unitPrice", header: '单价(元/㎡)', id: '单价',
    cell: ({ cell }) => cell.getValue() ? <div class=" ">{cell.getValue()}</div> : '-'
  },
  {
    accessorKey: "realUnitPrice",
    header: '计算面积单价',
    id: '计算面积单价',
    cell: ({ cell }) => cell.getValue() ? <div class=" ">{cell.getValue()}</div> : '-'

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
    accessorKey: 'onSellDate',
    header: '上架时间',
    id: '上架时间',
    cell: ({ cell }) => cell.getValue() ? new Date(cell.getValue() as string).toLocaleDateString() : '-'
  },
  {
    accessorKey: 'soldDate', header: '成交时间', id: '成交时间', cell: ({ cell }) => cell.getValue()
  },
  {
    accessorKey: 'buildingType', header: '楼型', id: '楼型', cell: ({ cell }) => cell.getValue()
  },
  {
    accessorKey: 'roomType', header: '房间', id: '房间', cell: ({ cell }) => cell.getValue()
  },
  {
    accessorKey: 'roomSubType', header: '楼层', id: '楼层', cell: ({ cell }) => cell.getValue()
  },

  {
    accessorKey: 'orientation', header: '朝向', id: '朝向', cell: ({ cell }) => cell.getValue()
  },
  {
    accessorKey: 'yearBuilt', header: '建造时间', id: '建造时间', cell: ({ cell }) => cell.getValue()
  },


]
/*
column END
 */


/*
table BEGIN
 */
let options: TableOptions<HouseTask> = {
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
  const cidList = data.map(t => t.cid)
  db.communityTasks.where('cid').anyOf(cidList).toArray().then(list => {
    relatedCommunity.value = new Map(list.map(t => [t.cid, t]))
  })
  //query and calc changes
  const hidList = data.map(t => t.hid)

  const changes = await db.houseChanges.where('hid').anyOf(hidList).sortBy('hid')
  const changesGroup = group(changes, t => t.hid)
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
function getRelatedDataFromChanges(changes: HouseChange[]) {
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
        <SelectButton v-model="priceRelatedShowType" value="count" can-cancel>调价次数</SelectButton>
        <SelectButton v-model="priceRelatedShowType" value="last" can-cancel>最近调价</SelectButton>
        <SelectButton v-model="priceRelatedShowType" value="max" can-cancel>最高价</SelectButton>
        <SelectButton v-model="priceRelatedShowType" value="min" can-cancel>最低价</SelectButton>
        <SelectButton v-model="priceRelatedShowType" value="init" can-cancel>初始价格</SelectButton>
        <HouseFieldsLackDesc />

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