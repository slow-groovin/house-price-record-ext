<script setup lang="ts">
//
import { db } from "@/entrypoints/db/Dexie";
import ColumnFilterCheckbox from "@/entrypoints/options/components/ColumnFilterCheckbox.vue";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import { CommunityTask, HouseStatusChange, HouseTask, HouseTaskStatus } from "@/types/lj";
import { QueryCache } from "@/utils/lib/QueryCache";
import { valueUpdater } from "@/utils/shadcn-utils";
import {
  AccessorKeyColumnDef,
  ColumnDef,
  ColumnFiltersState,
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  TableOptions,
  useVueTable,
  VisibilityState
} from '@tanstack/vue-table';
import { useLocalStorage } from "@vueuse/core";
import { h, onMounted, ref, watch } from "vue";

// type CrossKey=Extract<keyof HouseTask,keyof CommunityTask>
type CrossKey = "lastRunningAt" | "name" | "id" | "cid" | "status" | "accessRecord" | "createdAt" | 'markAccess'
type HouseStatusChangeWithDetail = HouseStatusChange &
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
const { data, rowCount } = defineProps<{
  data: HouseStatusChange[],
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
const pagination = ref({ pageIndex: 1, pageSize: 10 })

//初始化默认查询
emit('onPaginationChange', pagination.value.pageIndex, pagination.value.pageSize)
/**
 * pagination end
 */

/*
data
 */
const dataWithDetail = ref<HouseStatusChangeWithDetail[]>([])

async function queryDetailData() {
  const results: HouseStatusChangeWithDetail[] = []
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
    } as HouseStatusChangeWithDetail)
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
const columnHelper = createColumnHelper<HouseStatusChangeWithDetail>()
const columnDef: (ColumnDef<HouseStatusChangeWithDetail> | AccessorKeyColumnDef<HouseStatusChangeWithDetail, any>)[] = [
  columnHelper.group({
    header: 'change',
    columns: [
      columnHelper.accessor('id', {}),
      columnHelper.accessor('hid', {
        header: 'id',
        cell: ({ cell }) => h('a', {
          'class': 'text-green-500',
          'href': '#/h/task/detail?id=' + cell.getValue()
        }, cell.getValue())
      }) as ColumnDef<HouseStatusChangeWithDetail>,
      columnHelper.accessor('oldValue', {}),
      columnHelper.accessor('newValue', {}),
      columnHelper.accessor('at', {
        cell: ({ cell }) => new Date(cell.getValue()).toLocaleString()
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
        cell: ({ cell }) => h('a', { href: '#' + cell.getValue() }, cell.getValue() as string)
      } as ColumnDef<HouseStatusChangeWithDetail>,


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
let options: TableOptions<HouseStatusChangeWithDetail> = {
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


function isColVisible(col: string) {
  return table.getColumn(col)?.getIsVisible()
}
</script>

<template>
  <h1>H status Changes</h1>
  <ColumnFilterCheckbox :table="table" v-model:visibility="columnVisibility" />
  <div v-for="row in table.getRowModel().rows" class="flex  gap-2">
    <div>
      {{ new Date(row.getValue('at')).toLocaleString() }}
    </div>

    <div class="text-green-500 underline hover:cursor-pointer">
      <a :href="'/options.html#/h/task/detail?id=' + row.getValue('hid')">{{ row.getValue('hid') }}</a>
    </div>


    <div>
      {{ HouseTaskStatus[row.getValue('oldValue') as number] }}
    </div>
    ->
    <div>
      {{ HouseTaskStatus[row.getValue('newValue') as number] }}
    </div>


    <div v-if="isColVisible('communityName')">
      {{ row.getValue('communityName') }}
    </div>

    <div class="font-light italic" v-if="isColVisible('houseName')">
      {{ row.getValue('houseName') }}
    </div>

    <div class="font-bold " v-if="isColVisible('totalPrice')">
      {{ row.getValue('totalPrice') }}万
    </div>




  </div>

  <PaginationComponent v-if="pagination" :set-page-index="table.setPageIndex" :set-page-size="table.setPageSize"
    :pagination="pagination" :row-count="rowCount" />


</template>

<style scoped></style>