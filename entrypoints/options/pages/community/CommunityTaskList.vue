<script setup lang="tsx">
//
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {toast} from "vue-sonner";
import {sendMessage} from "webext-bridge/options";
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
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import {valueUpdater} from "@/utils/shadcn-utils";
import {calcOffset, PageState} from "@/utils/table-utils";
import {computed, h, onMounted, ref, toRaw} from "vue";
import {useLocalStorage} from "@vueuse/core";
import {Button} from "@/components/ui/button";
import {toInt} from "radash";
import {startPageEntry} from "@/entrypoints/reuse/community-control2";
import CommunityQueryDock from "@/entrypoints/options/components/CommunityQueryDock.vue";
import {CommunityQueryCondition, communityQueryConditionTemplate, SortState} from "@/types/query-condition";
import ColumnVisibleOption from "@/components/table/ColumnVisibleOption.vue";
import {ArgCache} from "@/utils/lib/ArgCache";
import {Collection, InsertType} from "dexie";
import {tryGreaterThanOrFalse, tryLessThanOrFalse} from "@/utils/operator";
import HouseTaskSortDock from "@/entrypoints/options/components/HouseTaskSortDock.vue";
import LoadingOverlay from "@/components/LoadingOverlay.vue";
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import TaskGroupQueryBox from "@/components/lj/TaskGroupQueryBox.vue";
import {useRoute} from "vue-router";
import {newQueryConditionFromQueryParam} from "@/entrypoints/reuse/query-condition";
import {useRouterQuery} from "@/composables/useRouterQuery";
import CidAndName from "@/components/lj/column/CidAndName.vue";

const {query} = useRoute()
const {_pageIndex, _pageSize} = query
const {pushQuery, removeQueries, pushQueries, removeQuery} = useRouterQuery()


/*
ref definition
 */
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = useLocalStorage<VisibilityState>('community-list-column-visibility', {})
const rowSelection = ref<RowSelectionState>({})

let value = newQueryConditionFromQueryParam(communityQueryConditionTemplate, query);
const queryCondition = ref<CommunityQueryCondition>(value)
const sortCondition = ref<SortState<CommunityTask>>({})
const groupForAdd = ref<{ groupId: number, name: string }>()

const queryCost = ref(0)
const isPending = ref(false)

const selectionCount = computed(() => Object.keys(rowSelection.value).length)
const queryScopeLabel = ref('')


if (query.groupId) {
  queryScopeLabel.value = `分组:[${query.groupId}]`
}

/*
ref definition DONE
 */


/**
 * pagination
 */

const pagination = ref<PageState>({
  pageSize: _pageSize?Number(_pageSize):10,
  pageIndex:_pageIndex? Number(_pageIndex):1,
})

const argCache = new ArgCache()
/**
 * pagination end
 */

/*
data
 */
const data = ref<CommunityTask[]>([])
const rowCount = ref(0)

async function queryData(_pageIndex?: number, _pageSize?: number) {
  console.debug('[CommunityTaskList] queryData()',_pageIndex,_pageSize)
  const pageIndex = argCache.retrieve('pageIndex', _pageIndex, 1)
  const pageSize = argCache.retrieve('pageSize', _pageSize, 10)
  const beginAt = Date.now()
  isPending.value = true


  let query: Collection<CommunityTask, number | undefined, InsertType<CommunityTask, "id">>

  /**
   * index match
   */
  const {
    cidInclude, nameInclude, city, lastRunningAtMax, lastRunningAtMin, createdAtMin, createdAtMax, avgTotalPriceMax,
    avgTotalPriceMin, avgUnitPriceMax, avgUnitPriceMin, onSellCountMin, onSellCountMax, groupId
  } = queryCondition.value
  const {field, order} = sortCondition.value
  let groupIdList: string[] = []
  if (groupId) {
    const group = await db.communityTaskGroups.get(groupId)
    groupIdList = group?.idList ?? []
  }

  if (order && field) {
    query = db.communityTasks.orderBy(field)
  } else if (lastRunningAtMin || lastRunningAtMax) {
    if (lastRunningAtMin && lastRunningAtMax) {
      query = db.communityTasks.where('lastRunningAt').between(new Date(lastRunningAtMin).getTime(), new Date(lastRunningAtMax).getTime(), true, true)
    } else if (lastRunningAtMin) {
      query = db.communityTasks.where('lastRunningAt').aboveOrEqual(new Date(lastRunningAtMin).getTime())
    } else {
      query = db.communityTasks.where('lastRunningAt').belowOrEqual(new Date(lastRunningAtMax!).getTime())
    }
  } else if (city) {
    query = db.communityTasks.where('city').equals(city)
  } else {
    query = db.communityTasks.toCollection()
  }


  /**
   * filter
   */
  const filters: ((item: CommunityTask) => boolean)[] = []
  if (cidInclude) filters.push(item => item.cid.includes(cidInclude))
  if (nameInclude) filters.push(item => item.name?.includes(nameInclude) ?? false)
  if (city) filters.push(item => item.city?.includes(city) ?? false)
  if (lastRunningAtMax) filters.push(item => item.lastRunningAt <= new Date(lastRunningAtMax).getTime())
  if (lastRunningAtMin) filters.push(item => item.lastRunningAt >= new Date(lastRunningAtMin).getTime())
  if (createdAtMax) filters.push(item => item.createdAt <= new Date(createdAtMax).getTime())
  if (createdAtMin) filters.push(item => item.createdAt >= new Date(createdAtMin).getTime())
  if (avgTotalPriceMax) filters.push(item => tryLessThanOrFalse(item?.avgTotalPrice, avgTotalPriceMax))
  if (avgTotalPriceMin) filters.push(item => tryGreaterThanOrFalse(item?.avgTotalPrice, avgTotalPriceMin))
  if (avgUnitPriceMax) filters.push(item => tryLessThanOrFalse(item?.avgUnitPrice, avgUnitPriceMax))
  if (avgUnitPriceMin) filters.push(item => tryGreaterThanOrFalse(item?.avgUnitPrice, avgUnitPriceMin))
  if (onSellCountMax) filters.push(item => tryLessThanOrFalse(item?.onSellCount, onSellCountMax))
  if (onSellCountMin) filters.push(item => tryGreaterThanOrFalse(item?.onSellCount, onSellCountMin))
  if(groupIdList.length>0) filters.push(item=>groupIdList.includes(item.cid))

  //应用filter
  if (filters.length) {
    query = query.filter(item => filters.every(f => f(item)))
  }


  rowCount.value = await query.count()

  if(order && field){
    if(order==='desc')
      query=query.reverse()
  }

  data.value = await query.offset(calcOffset(pageIndex, pageSize)).limit(pageSize).toArray()


  queryCost.value = Date.now() - beginAt
  isPending.value = false
}


/*
data END
 */

/*
column BEGIN
 */
const columnHelper = createColumnHelper<CommunityTask>()
const columnDef: (ColumnDef<CommunityTask>)[] = [
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
  {    accessorKey:'id',     },

  {
    accessorKey: 'cid',
    id: 'cid',
    header: 'cid header',
    cell: ({cell}) => h('a', {
      'class': 'link',
      'target':'_blank',
      'href': '#/c/task/detail?id=' + cell.getValue()
    }, cell.getValue() as string)
  } as ColumnDef<CommunityTask>,
  {accessorKey:'name',cell:({cell})=><CidAndName name="123" id="456"/>},
  {accessorKey:'city'},
  {accessorKey:'onSellCount'},
  {accessorKey:'avgTotalPrice'},
  {accessorKey:'avgUnitPrice'},
  {accessorKey:'runningCount'},
  {accessorKey:'visitCountIn90Days'},
  {accessorKey:'doneCountIn90Days'},
  {accessorKey:'visitCountIn90Days'},
  {accessorKey:'createdAt'},
  {accessorKey:'lastRunningAt'},
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
    onPaginationUpdate(pagination.value.pageIndex, pagination.value.pageSize)

  }
}
const table = useVueTable(options)

/*
table END
 */

/**更新分页*/
async function onPaginationUpdate(pageIndex: number, pageSize: number) {
  await pushQuery('_pageIndex', pageIndex)
  await pushQuery('_pageSize', pageSize)
  await queryData(pageIndex, pageSize)
}


/**更新查询条件*/
async function onQueryConditionUpdate() {
  await removeQueryConditionQueryParam()
  const condition = queryCondition.value
  await pushQueries(condition)

  // queryCache.del('pageIndex') //重置pageIndex
  // await removeQuery('_pageIndex')
  await queryData()
}


async function removeQueryConditionQueryParam() {
  await removeQueries(Object.keys(communityQueryConditionTemplate))
}

async function beginCrawlCommunities() {
  const communityList = Object.keys(rowSelection.value).map(s => toInt(s)).map(i => toRaw(data.value[i]))
  startPageEntry(communityList)
}

async function deleteSelectedTasks() {
  const ids = Object.keys(rowSelection.value).map(s => Number(s)).map(index => data.value[index].id)
  await db.communityTasks.bulkDelete(ids)
  alert(`删除成功!${ids.length}个任务`)
  rowSelection.value = {}
  data.value = data.value.filter(item => !ids.includes(item.id))
}

async function addToGroup() {
  if (!groupForAdd.value) return
  const group = await db.communityTaskGroups.get(groupForAdd.value.groupId)
  if (!group) {
    toast.error('没有找到分组')
    return
  }
 const selectedIdList = Object.keys(rowSelection.value)
    .map(s => Number(s))
    .map(i => data.value[i].cid)
  group.idList = Array.from(new Set<string>([...group?.idList ?? [], ...selectedIdList]))
  await db.communityTaskGroups.update(groupForAdd.value.groupId, {
    idList: group.idList
  })
  toast.success('添加成功', {
    action: {
      label: '去查看', onClick: () => {
        sendMessage('openOptionPage', '/options.html#/c/group/list', 'background')
      }
    }
  })
}

onMounted(() => {
  queryData(pagination.value.pageIndex, pagination.value.pageSize)
})

</script>

<template>
  <h1 class="text-3xl font-extrabold text-center my-4">小区任务</h1>

  <div class="relative flex  flex-col p-2 rounded border">
    <h2 class="text-2xl font-bold">查询条件</h2>
    <LoadingOverlay v-if="isPending"/>
    <CommunityQueryDock v-if="queryCondition" v-model="queryCondition" @update="onQueryConditionUpdate"/>
  </div>

  <div class="relative mb-5 rounded p-2 border">
    排序:
    <HouseTaskSortDock v-model="sortCondition" :fields="['lastRunningAt','createdAt']"
                       @update="onQueryConditionUpdate"/>
    <LoadingOverlay v-if="isPending" disable-anim/>
  </div>


  <div class="relative flex items-center p-1 my-2 gap-4">
    <div> 共 <span class="text-primary">{{ rowCount }}</span> 条</div>
    <div> 查询耗时: <span class="text-primary">{{ queryCost / 1000 }}</span> 秒</div>
    <div v-if="selectionCount">选中 <span class="text-primary">{{ selectionCount }}</span> 条</div>
    <ConfirmDialog @confirm="beginCrawlCommunities()">
      <template #trigger>
        <Button class="p-1 h-fit">运行任务(选中)</Button>
      </template>
      开始运行 {{ selectionCount }} 个任务?
    </ConfirmDialog>

    <ConfirmDialog @confirm="deleteSelectedTasks">
      <template #trigger>
        <Button variant="destructive" class="p-1 h-fit">删除(选中)</Button>
      </template>
      <span class="text-red-700 font-bold">
        确认要删除选中的 {{ selectionCount }} 个任务吗?
      </span>
    </ConfirmDialog>

    <Dialog>
      <DialogTrigger as-child>
        <Button class="p-1 h-fit">添加到分组(选中)</Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>加入分组</DialogTitle>
          <DialogDescription>
            <a href="/options.html#/h/group/" class="link">去创建分组</a>
          </DialogDescription>
        </DialogHeader>

        <TaskGroupQueryBox v-model="groupForAdd"/>

        <DialogFooter class="sm:justify-start">
          <DialogClose as-child>
            <Button type="button" variant="default" @click="addToGroup()">
              添加
            </Button>
          </DialogClose>
          <DialogClose as-child>
            <Button type="button" variant="destructive">
              取消
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <LoadingOverlay v-if="isPending" disable-anim/>
  </div>


  <div class="flex">
    <h1 class="p-1 m-1 border rounded">DEBUG:</h1>
    <div> {{ queryCondition }}</div>
    <div> {{ sortCondition }}</div>

  </div>

  <ColumnVisibleOption :columns="table.getAllColumns()"/>

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


  <div class="relative">
    <PaginationComponent
      :set-page-index="table.setPageIndex"
      :set-page-size="table.setPageSize"
      :pagination="pagination"
      :row-count="rowCount"/>
    <LoadingOverlay v-if="isPending" disable-anim/>

  </div>


</template>

<style scoped>

</style>