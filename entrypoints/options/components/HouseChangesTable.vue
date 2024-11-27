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
import {QueryCache} from "@/utils/lib/QueryCache";
import {h, onMounted, ref, watch} from "vue";
import {useLocalStorage} from "@vueuse/core";

// type CrossKey=Extract<keyof HouseTask,keyof CommunityTask>
type CrossKey = "lastRunningAt" | "name" | "id" | "cid" | "status" | "accessRecord" | "createdAt" | 'markAccess'
type HouseChangeWithDetail = HouseChange &
  Omit<HouseTask, CrossKey> &
  Omit<CommunityTask, CrossKey> &
  {
    houseName?: string,
    communityName?: string
  } &
  {
    [other: string]: any
  }


/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = useLocalStorage<VisibilityState>('house-changes-column-visibility', {})
const rowSelection = ref({})
const {data, rowCount} = defineProps<{
  data: HouseChange[],
  rowCount: number
}>()
/*
ref definition DONE
 */


/**
 * pagination
 */

const emit = defineEmits({
  onPaginationChange: (pageIndex: number, pageSize: number) => {
    return true;// 不校验
  }
})
// const pagination = defineModel<PageState>('pagination')
const pagination = ref({pageIndex: 1, pageSize: 10})

//初始化默认查询
emit('onPaginationChange', pagination.value.pageIndex, pagination.value.pageSize)
/**
 * pagination end
 */

/*
data
 */
const dataWithDetail = ref<HouseChangeWithDetail[]>([])

async function queryDetailData() {
  const results: HouseChangeWithDetail[] = []
  //changes
  const changes = data


  //houses info
  const houseQueryCache = new QueryCache<HouseTask>()
  const communityQueryCache = new QueryCache<CommunityTask>()
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i]
    const house = await houseQueryCache.getData('hid:' + change.hid, async () => {
      return db.houseTasks.where('hid').equals(change.hid).first();
    })
    const community = await communityQueryCache.getData('cid:' + change.cid, async () => {
      return db.communityTasks.where('cid').equals(change.cid).first()
    })

    results.push({
      ...house,
      ...community,
      ...change,
      houseName: house?.name,
      communityName: community?.name,
    } as HouseChangeWithDetail)
  }

  //communities info
  dataWithDetail.value = results
}

/*
data END
 */

/*
column BEGIN
 */
const columnHelper = createColumnHelper<HouseChangeWithDetail>()
const columnDef: (ColumnDef<HouseChangeWithDetail> | AccessorKeyColumnDef<HouseChangeWithDetail, any>)[] = [
  columnHelper.group({
    header: 'change',
    columns: [
      columnHelper.accessor('id', {}),
      columnHelper.accessor('hid', {
        header: 'id',
        cell: ({cell}) => h('a', {
          'class': 'text-green-500',
          'href': '#/h/task/detail?id=' + cell.getValue()
        }, cell.getValue())
      }) as ColumnDef<HouseChangeWithDetail>,
      columnHelper.accessor('oldValue', {}),
      columnHelper.accessor('newValue', {}),
      columnHelper.accessor('at', {
        cell: ({cell}) => new Date(cell.getValue()).toLocaleString()
      }),
    ]
  }),

  columnHelper.group({
    header: 'basic info',
    columns: [
      {
        accessorKey: 'cid',
        id: 'cid',
        header: 'cid header',
        cell: ({cell}) => h('a', {href: '#' + cell.getValue()}, cell.getValue() as string)
      } as ColumnDef<HouseChangeWithDetail>,


      columnHelper.accessor('houseName', {}),
      columnHelper.accessor('communityName', {}),
      columnHelper.accessor('city', {}),
      columnHelper.accessor('totalPrice', {}),
      columnHelper.accessor('area', {}),
      columnHelper.accessor('realArea', {}),
      columnHelper.accessor('unitPrice', {}),
      columnHelper.accessor('realUnitPrice', {}),


    ]
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
    return dataWithDetail.value
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
    console.log('rowCount changed.')
    options.rowCount = rowCount

  })
  watch(() => data, () => {
    console.log('data changed.')

    queryDetailData()

  })
})


</script>

<template>
  <h1>H Changes</h1>
  <ColumnFilterCheckbox :table="table" v-model:visibility="columnVisibility"/>
  <!--  todo change Table to timeline,  hide basic info button-->
  <Table>
    <TableHeader>
      <TableRow v-for="headerGroup in table.getHeaderGroups()">
        <TableHead v-for="header in headerGroup.headers" :colspan="header.colSpan" class="text-center">
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
    v-if="pagination"
    :set-page-index="table.setPageIndex"
    :set-page-size="table.setPageSize"
    :pagination="pagination"
    :row-count="rowCount"/>


</template>

<style scoped>

</style>