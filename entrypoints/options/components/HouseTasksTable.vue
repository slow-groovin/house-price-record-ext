<script setup lang="tsx">
//
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
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
import {CommunityTask, HouseTask, HouseTaskStatus} from "@/types/lj";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import {cn, valueUpdater} from "@/utils/shadcn-utils";
import {onMounted, ref, watch} from "vue";
import {useLocalStorage} from "@vueuse/core";
import ColumnVisibleOption from "@/components/table/ColumnVisibleOption.vue";
import {db} from "@/utils/client/Dexie";
import {Icon} from '@iconify/vue'
import {genHousePageUrl} from "@/utils/lj-url";
import RealAreaDesc from "@/entrypoints/options/components/description/RealAreaDesc.vue";
import {formatDistanceToNowHoursOrDays} from "@/utils/date";
import {HStatusColor} from "@/entrypoints/reuse/enum-corespond";
import StatusDesc from "@/entrypoints/options/components/description/StatusDesc.vue";
/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = useLocalStorage<VisibilityState>('house-tasks-column-visibility', {})
const rowSelection = defineModel<RowSelectionState>('rowSelection')
const {data, rowCount} = defineProps<{
  data: HouseTask[],
  rowCount: number
}>()
const relatedCommunity = ref(new Map<string, CommunityTask>())


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
const pagination = ref({pageIndex: 1, pageSize: 10})

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
    header: ({table}: { table: any }) => {
      return (
        <input type="checkbox"
               checked={table.getIsAllRowsSelected()}
               onChange={table.getToggleAllRowsSelectedHandler()}
        ></input>
      )
    },
    cell: ({row}: { row: any }) => {
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
    cell: ({cell}) =>
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
      return {name: originalRow.name, hid: originalRow.hid, city: originalRow.city};
    },
    cell: ({cell}) => {
      const {name, hid, city} = cell.getValue() as { name?: string, hid?: string, city?: string }
      return <div class="text-xs">
        <a href={"#/h/task/detail?id=" + hid} class="link" target="_blank">{hid}</a>
        <div class="text-nowrap flex flex-nowrap">
          {name}
          <a class="inline-block link text-base hover:bg-gray-200" href={genHousePageUrl(city!, hid!)} target="_blank"
             rel="noreferrer">
            <Icon icon="tdesign:jump"/>
          </a>
        </div>
      </div>
    }
  },
  {
    accessorKey: 'area', header: '建筑面积', id: '建筑面积',
    cell: ({cell}) => cell.getValue() + "㎡"
  },
  {
    accessorKey: 'realArea', id: '计算面积',
    header: () => {
      return <div class="flex items-center">计算面积<RealAreaDesc/></div>
    },
    cell: ({cell, row}) => {
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
    cell: ({cell}) => cell.getValue() ? <div class="text-green-500 font-bold">{cell.getValue()}万</div> : '-'
  },
  {
    accessorKey: "unitPrice", header: '单价(元/㎡)', id: '单价',
    cell: ({cell}) => cell.getValue() ? <div class=" ">{cell.getValue()}</div> : '-'
  },
  {
    accessorKey: "realUnitPrice",
    header: '计算面积单价',
    id: '计算面积单价',
    cell: ({cell}) => cell.getValue() ? <div class=" ">{cell.getValue()}</div> : '-'

  },
  {
    accessorKey: "createdAt",
    header: '任务创建',
    id: '任务创建',
    cell: ({cell}) => {
      if(!cell.getValue()) return '-'
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
    cell: ({cell}) => {
      if(!cell.getValue()) return '-'
      return <div class="text-xs">
        <div class=" text-green-400">{formatDistanceToNowHoursOrDays(cell.getValue())}</div>
        <div>{new Date(cell.getValue() as string).toLocaleString()}</div>
      </div>
    }
  },
  {
    accessorKey:'onSellDate',header:'上架时间',id:'上架时间',cell:({cell})=>cell.getValue()?new Date(cell.getValue() as string).toLocaleDateString():'-'
  },
  {
    accessorKey:'soldDate',header:'售出时间',id:'售出时间',cell:({cell})=>cell.getValue()
  },
  {
    accessorKey:'buildingType',header:'楼型',id:'楼型',cell:({cell})=>cell.getValue()
  },
  {
    accessorKey:'roomType',header:'房间',id:'房间',cell:({cell})=>cell.getValue()
  },
  {
    accessorKey:'roomSubType',header:'楼层',id:'楼层',cell:({cell})=>cell.getValue()
  },

  {
    accessorKey:'orientation',header:'朝向',id:'朝向',cell:({cell})=>cell.getValue()
  },
  {
    accessorKey:'yearBuilt',header:'建造时间',id:'建造时间',cell:({cell})=>cell.getValue()
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
    console.log('rowCount changed.')
    options.rowCount = rowCount
  })
  watch(() => data, () => {
    //query related community
    const cidList = data.map(t => t.cid)
    db.communityTasks.where('cid').anyOf(cidList).toArray().then(list => {
      relatedCommunity.value = new Map(list.map(t => [t.cid, t]))
    })
  })
})


</script>

<template>
  <div class="flex gap-2">
    <StatusDesc/>
    <ColumnVisibleOption :columns="table.getAllColumns()"/>
  </div>
  <Table class="w-fit overflow-scroll text-nowrap">
    <TableHeader class="border-l-8">
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
      <TableRow v-for="(row,index) in table.getRowModel().rows" class="border-l-8 rounded-l-2xl"
                :class="cn('hover:bg-'+HStatusColor[data[index].status]+'/20','border-l-'+HStatusColor[data[index].status],)">
        <TableCell v-for="cell in row.getVisibleCells()">
          <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
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