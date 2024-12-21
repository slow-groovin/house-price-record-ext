<script setup lang="tsx">
//
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  TableOptions,
  useVueTable,
} from '@tanstack/vue-table'
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import {valueUpdater} from "@/utils/shadcn-utils";
import {onMounted, ref, watch} from "vue";
import {formatDistanceToNowHoursOrDays} from "@/utils/date";
import {TaskGroup} from "@/types/group";
import {Button} from "@/components/ui/button";
import {Icon} from "@iconify/vue";
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";
import {db} from "@/utils/client/Dexie";
import {toast} from "vue-sonner";


/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const deletedIds = ref<number[]>([])
const rowSelection = defineModel<RowSelectionState>('rowSelection')
const {data,type} = defineProps<{
  data: TaskGroup[],
  type: 'community'|'house',
}>()
/*
ref definition DONE
 */

function detailUrl(id?:number){
  const prefix=type==='community'?'c':'h'
  return `#/${prefix}/group/detail?id=${id}`
}

/**
 * pagination
 */
const emit = defineEmits<{
  (e: 'onPaginationChange', pageIndex: number, pageSize: number): void
  (e: 'onRunGroup', index: number): void
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

const columnDef: (ColumnDef<TaskGroup>)[] = [
  {
    accessorKey: 'id',
    id: 'id',
    header: 'id',
    cell: ({cell}) =>
      <div class="text-xs">
        <div class="flex">
          <a href={detailUrl(cell.getValue())} class="link " target="_blank">
            <div>{cell.getValue()}</div>
          </a> &nbsp;&nbsp;&nbsp;
        </div>
      </div>

  } as ColumnDef<TaskGroup>,


  {
    accessorKey: 'name',
    header: '名称',
    id: '名称',
    cell: ({cell, row}) => {
      return <a href={detailUrl(row.getValue('id'))} class="hover-link"
                target="_blank">{cell.getValue()}</a>
    }
  },
  {
    accessorKey: 'idList', header: '数量', id: '数量',
    cell: ({cell, row}) => {
      return <a href={detailUrl(row.getValue('id'))} class="hover-link"
                target="_blank">{cell.getValue()?.length}</a>
    }
  },

  {
    accessorKey: "createdAt",
    header: '创建时间',
    id: '创建时间',
    cell: ({cell}) => {
      if (!cell.getValue()) return '-'
      return <div class="flex text-xs text-neutral-600 gap-2">
        <div class=" text-blue-400">({formatDistanceToNowHoursOrDays(cell.getValue())})</div>
        <div>{new Date(cell.getValue() as string).toLocaleString()}</div>
      </div>
    }
  },

  {
    accessorKey: "lastRunningAt",
    header: '最后运行',
    id: '最后运行',
    cell: ({cell}) => {
      if (!cell.getValue()) return '-'
      return <div class="text-xs flex gap-2">
        <div class=" text-green-400">({formatDistanceToNowHoursOrDays(cell.getValue())})</div>
        <div>{new Date(cell.getValue() as string).toLocaleString()}</div>
      </div>
    }
  },
  {
    header: '操作',
    id: '操作',
    cell: ({cell, row}) => <div class="flex gap-2 items-center">
      <a href={detailUrl(row.getValue('id'))} class="link" target="_blank">查看</a>
      <button onClick={()=>emit('onRunGroup',row.index)}
        class="flex items-center border rounded gap-0 p-0.5 text-sm bg-green-500 text-white hover:outline  outline-neutral-300 cursor-pointer">
        <Icon icon="solar:play-bold" class="w-4 h-4" />运行
      </button>

    </div>,
    enableSorting: false,
  },
]
/*
column END
 */


/*
table BEGIN
 */
let options: TableOptions<TaskGroup> = {
  get data() {
    return data
  },
  get columns() {
    return columnDef
  },
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),


  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  state: {
    get sorting() {
      return sorting.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get rowSelection() {
      return rowSelection.value
    },
    get pagination() {
      return pagination.value
    },

  },
  // enableRowSelection: true, //enable row selection for all rows
  autoResetPageIndex: true,
  // manualPagination: true,
  // pageCount:30,
  // rowCount: rowCount,

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


/*
 * functions BEGIN
 */
const sortedStatusIcon = (status?: false | 'asc' | 'desc') => {
  if (status === 'asc') {
    return <Icon icon="material-symbols:arrow-upward" class="border rounded border-amber-500  w-4 h-4"/>
  } else if (status === 'desc') {
    return <Icon icon="material-symbols:arrow-downward" class="border rounded border-amber-500 w-4 h-4"/>
  } else {
    return <Icon icon="bx:sort" class="w-4 h-4"/>
  }
}

async function deleteGroup(id?: number) {
  if (!id) {
    toast.error('参数错误:' + id)
    return
  }
  await db.communityTaskGroups.delete(id)
  deletedIds.value.push(id)
  toast.success('删除成功')
}


/*
 * functions END
 */
onMounted(() => {

  // watch(() => rowCount, () => {
  //   console.log('rowCount changed.')
  //   options.rowCount = rowCount
  // })
  watch(() => data, () => {
    //query related community
  })
})


</script>

<template>
  <div class="flex gap-2 items-center">
    <div class="flex">
    </div>
  </div>
  <Table class="w-fit overflow-scroll text-nowrap">
    <TableHeader class="">
      <TableRow v-for="headerGroup in table.getHeaderGroups()">
        <TableHead v-for="header in headerGroup.headers">
          <div class="flex items-center">
            <FlexRender
              v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
              :props="header.getContext()"
            />
            <div v-if="header.getContext().column.getCanSort()"
                 @click="header.getContext().column.toggleSorting()"
                 class="hover:bg-gray-200 ">
              <Component :is="sortedStatusIcon(header.getContext().column.getIsSorted())"/>
            </div>

          </div>

        </TableHead>

      </TableRow>

    </TableHeader>
    <TableBody>
      <template v-for="(row,index) in table.getRowModel().rows">
        <TableRow v-if="!deletedIds.includes(data[index].id??-1)"  class="rounded-l-2xl">
          <TableCell v-for="cell in row.getVisibleCells()">
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()"/>
          </TableCell>

          <!--        delete-->
          <ConfirmDialog @confirm="deleteGroup(data[index].id)">
            <template #trigger>
              <td>
                <Icon icon="material-symbols:delete"
                      class="my-auto w-6 h-6 text-red-700 border rounded hover:outline outline-neutral-300 cursor-pointer"/>
              </td>
            </template>
            <span class="text-red-700 font-bold">
            确认要删除这个任务组吗?
          </span>
          </ConfirmDialog>
        </TableRow>
      </template>

    </TableBody>
  </Table>

  <PaginationComponent
    zero-based
    :set-page-index="table.setPageIndex"
    :set-page-size="table.setPageSize"
    :pagination="pagination"
    :row-count="table.getRowCount()"/>


</template>

<style scoped>

</style>