<script setup lang="ts">
import { db } from "@/utils/client/Dexie";
import { HouseTask, HouseTaskStatus } from "@/types/lj";
import { calcOffset } from "@/utils/table-utils";
import HouseTasksTable from "@/entrypoints/options/components/HouseTasksTable.vue";
import { computed, onMounted, ref } from "vue";
import { RowSelectionState } from "@tanstack/vue-table";
import { Button } from "@/components/ui/button";
import { browser } from "wxt/browser";
import HouseTaskTableQueryDock from "@/entrypoints/options/components/HouseTaskTableQueryDock.vue";
import {
  frequentFieldZhMap,
  houseQueryConditionTemplate,
  HouseTaskQueryCondition,
  SortState
} from "@/types/query-condition";
import { ArgCache } from "@/utils/lib/ArgCache";
import GenericSortDock from "@/entrypoints/options/components/GenericSortDock.vue";
import { Collection, InsertType } from "dexie";
import { isNumber } from "radash";
import { useRoute } from "vue-router";
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
import { toast } from "vue-sonner";
import { sendMessage } from "@/messaging";
import { useRouterQuery } from "@/composables/useRouterQuery";
import { newQueryConditionFromQueryParam } from "@/entrypoints/reuse/query-condition";
import { useExtTitle } from "@/composables/useExtInfo";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import { mergeParams } from "@/utils/variable";
import { goRunHouseTasksStartPage } from "@/entrypoints/reuse/house-control2";
const { isDebug } = useDevSetting()

useExtTitle('房源任务列表')

/*
route handle BEGIN
 */
const { pushQuery, removeQuery, pushQueries, removeQueries } = useRouterQuery()
const { query } = useRoute()
const { _pageIndex, queryPageSize } = query
const _pageSize = mergeParams(queryPageSize, localStorage.getItem('house-list-page-size'))

const queryScopeLabel = ref('')

/*
route handle END
 */

/*
const BEGIN
 */
const queryCondTemplate: HouseTaskQueryCondition = {
  addedType: 0, cidEqual: "", cidInclude: "", city: "", createdAtMax: "", createdAtMin: "", groupId: 0, hidInclude: "",
  status: HouseTaskStatus.running, totalPriceMax: 0, totalPriceMin: 0
}
/*
const END
 */

/*
ref definition
 */
const data = ref<HouseTask[]>([])
const rowCount = ref(0)

const queryCondition = ref<HouseTaskQueryCondition>(newQueryConditionFromQueryParam(houseQueryConditionTemplate, query))

if (query.groupId) {
  queryScopeLabel.value = `分组:[${query.groupId}]`
} else if (query.cidEqual) {
  queryScopeLabel.value = `小区: [${query.cidEqual}]`
}


const rowSelection = ref<RowSelectionState>({})
const queryCache = new ArgCache()
const queryCost = ref(0)

const sortFields: (keyof HouseTask)[] = ['id', 'createdAt', 'totalPrice', 'lastRunningAt']

const sortCondition = ref<SortState<HouseTask>>({})
const selectionCount = computed(() => Object.keys(rowSelection.value).length)

const groupForAdd = ref<{ groupId: number, name: string }>()


/*
ref definition DONE
 */

/*
data
 */
async function queryData(_pageIndex?: number, _pageSize?: number) {
  rowSelection.value = {}
  const beginAt = Date.now()

  const {
    addedType,
    cidInclude,
    cidEqual,
    city,
    createdAtMax,
    createdAtMin,
    hidInclude,
    status,
    totalPriceMax,
    totalPriceMin,
    groupId
  } = queryCondition.value
  const { field, order } = sortCondition.value
  const filters: ((task: HouseTask) => boolean)[] = []

  let groupIdList: string[] = []
  if (groupId) {
    const group = await db.houseTaskGroups.get(groupId)
    groupIdList = group?.idList ?? []
  }

  let query: Collection<HouseTask, number | undefined, InsertType<HouseTask, "id">>


  /**
   * indexDB中  where只能匹配一个单索引, 所以按照优先级选用某个字段匹配
   * 如果有排序, 则使用索引排序
   * 否则, 优先使用可能范围更小的的索引
   */
  if (groupIdList.length > 0) {
    //后面处理
    query = db.houseTasks.where('id').notEqual(-1)
  } else if (cidEqual) {
    query = db.houseTasks.where('cid').equals(cidEqual)
  } else if (order && field) {
    console.log(order, field)
    query = db.houseTasks.orderBy(field)
    if (order !== 'asc') {
      query = query.reverse()
    }
  } else if (createdAtMax || createdAtMin) {
    if (!createdAtMin && createdAtMax) {
      query = db.houseTasks.where('createdAt').belowOrEqual(new Date(createdAtMax).getTime())
    } else if (!createdAtMax && createdAtMin) {
      query = db.houseTasks.where('createdAt').aboveOrEqual(new Date(createdAtMin).getTime())
    } else {
      query = db.houseTasks.where('createdAt').between(new Date(createdAtMin!).getTime(), new Date(createdAtMax!).getTime(), true, true)
    }
  } else if (isNumber(totalPriceMax) || isNumber(totalPriceMin)) {
    if (!isNumber(totalPriceMin)) {
      query = db.houseTasks.where('totalPrice').belowOrEqual(totalPriceMax)
    } else if (!isNumber(totalPriceMax)) {
      query = db.houseTasks.where('totalPrice').aboveOrEqual(totalPriceMin)
    } else {
      query = db.houseTasks.where('totalPrice').between(totalPriceMin, totalPriceMax, true, true)
    }
  } else if (status) {
    query = db.houseTasks.where('status').equals(status)
  } else if (city) {
    query = db.houseTasks.where('city').equals(city)
  } else {
    query = db.houseTasks.where('id').notEqual(-1)
  }


  /*
  字段匹配, 仅使用filter. 前面where匹配的index不做额外排除(减少代码复杂)
   */
  if (hidInclude) {
    filters.push(s => s.hid.includes(hidInclude))
  }
  if (cidInclude) {
    filters.push(s => s.cid.includes(cidInclude))
  }
  if (cidEqual) {
    filters.push(s => s.cid === cidEqual)
  }
  if (city) {
    filters.push(s => s.city.includes(city))
  }
  if (addedType) {
    filters.push(s => s.addedType === addedType)
  }
  if (totalPriceMin) {
    filters.push(s => s.totalPrice !== undefined && s.totalPrice >= totalPriceMin)
  }
  if (totalPriceMax) {
    filters.push(s => s.totalPrice !== undefined && s.totalPrice <= totalPriceMax)
  }
  if (createdAtMin) {
    filters.push(s => s.createdAt >= new Date(createdAtMin).getTime())
  }
  if (createdAtMax) {
    filters.push(s => s.createdAt <= new Date(createdAtMax).getTime())
  }
  if (cidEqual) {
    query = query.filter(s => s.cid === cidEqual)
  }
  if (status) {
    filters.push(s => s.status === status)
  }
  if (filters.length)
    query = query.filter(t => filters.every(f => f(t)))

  rowCount.value = await query.count()

  //这里anyOf(...).count(...)有bug,会导致查询失效, 所以需要单独处理
  if (groupIdList.length) {
    query = db.houseTasks.where('hid').anyOf(groupIdList).filter(t => filters.every(f => f(t)))
    rowCount.value = await db.houseTasks.where('hid').anyOf(groupIdList).filter(t => filters.every(f => f(t))).count()
  }


  const pageIndex = queryCache.retrieve('pageIndex', _pageIndex, 1)
  const pageSize = queryCache.retrieve('pageSize', _pageSize, 10)
  query = query.offset(calcOffset(pageIndex, pageSize)).limit(pageSize)

  //如果没有用索引进行排序,需要查询后排序
  if ((groupIdList.length > 0 || cidEqual) && (order && field)) {
    if (order === 'asc') {
      data.value = await query.sortBy(field)

    } else {
      data.value = await query.reverse().sortBy(field)
    }
  } else {
    data.value = await query.toArray()
  }
  queryCost.value = Date.now() - beginAt
}

/*
data END
 */
/**更新分页*/
async function onPaginationUpdate(pageIndex: number, pageSize: number) {
  await pushQuery('_pageIndex', pageIndex)
  await pushQuery('_pageSize', pageSize)
  localStorage.setItem('house-list-page-size', pageSize + '')
  await queryData(pageIndex, pageSize)
}

/**更新查询条件*/
async function onUpdateQueryCondition() {
  await removeQueryConditionQueryParam()
  const condition = queryCondition.value
  await pushQueries(condition)

  // queryCache.del('pageIndex') //重置pageIndex
  // await removeQuery('_pageIndex')
  await queryData()
}


async function removeQueryConditionQueryParam() {
  await removeQueries(Object.keys(queryCondTemplate))
}

/**开始选中的任务运行*/
async function goBeginBatchSelectedTasks() {
  const hidList = Object.keys(rowSelection.value)
    .map(s => Number(s))
    .map(i => data.value[i].hid)
  goRunHouseTasksStartPage(hidList)
}

/**开始查询的所有的任务运行*/
async function goBeginAllSelectedTasks() {
  const hidList = Object.keys(rowSelection.value)
    .map(s => Number(s))
    .map(i => data.value[i].hid)
  const id = await db.tempBatchHouse.add({ hidList })

  const window = await browser.windows.getCurrent({})
  const newWindow = await browser.windows.create({ state: 'maximized' })
  await chrome.sidePanel.open({ windowId: newWindow.id as number })
  await chrome.sidePanel.setOptions({ path: '/sidepanel.html#/h/batch?id=' + id })
}

async function deleteSelectedTasks() {
  const ids = Object.keys(rowSelection.value).map(s => Number(s)).filter(index => data.value[index]?.id).map(index => data.value[index].id)
  await db.houseTasks.bulkDelete(ids)
  alert(`删除成功!${ids.length}个任务`)
  data.value = data.value.filter(item => !ids.includes(item.id))
  rowSelection.value = {}
}


async function addToGroup() {
  if (!groupForAdd.value) {
    toast.error('请选择分组')
    return
  }
  const group = await db.houseTaskGroups.get(groupForAdd.value.groupId)
  if (!group) return
  const before = group.idList
  const selectedIdList = Object.keys(rowSelection.value)
    .map(s => Number(s))
    .map(i => data.value[i].hid)
  group.idList = [...new Set<string>([...before, ...selectedIdList])]

  await db.houseTaskGroups.update(groupForAdd.value.groupId, group)
  toast.success('添加成功', {
    action: {
      label: '去查看', onClick: () => {
        sendMessage('openOptionPage', '/options.html#/h/group/list')
      }
    }
  }
  )
}

onMounted(() => {
})

</script>

<template>
  <h1 class="text-2xl mx-2 my-4 font-bold">房源任务<span v-if="queryScopeLabel">({{ queryScopeLabel }})</span></h1>
  <div class="border rounded-lg p-2">
    <h2 class="mb-3 mx-2">查询条件:</h2>
    <HouseTaskTableQueryDock v-if="queryCondition" v-model="queryCondition" @update="onUpdateQueryCondition" />
  </div>
  <div class="flex items-center p-2 gap-4 border rounded my-2">
    <span>排序:</span>
    <GenericSortDock :fields="sortFields" v-model="sortCondition" :field-text-map="frequentFieldZhMap"
      @update="onUpdateQueryCondition" />
  </div>


  <div class="flex border rounded" v-if="isDebug">
    <span class="border rounded mr-2">Debug</span>
    {{ queryCondition }} {{ sortCondition }}
  </div>
  <div class="flex gap-4  mb-4">
    <div>共 <span class="text-primary">{{ rowCount }}</span> 个</div>
    <div>查询耗时: <span class="text-primary">{{ queryCost / 1000 }}</span> 秒</div>
    <div v-if="rowSelection">选中 <span class="text-primary"> {{ selectionCount }}</span> 个</div>

    <ConfirmDialog @confirm="goBeginBatchSelectedTasks">
      <template #trigger>
        <Button class="p-1 h-fit" :disabled="!selectionCount">开始运行(选中)</Button>
      </template>
      开始运行 {{ selectionCount }} 个任务?
    </ConfirmDialog>


    <ConfirmDialog @confirm="deleteSelectedTasks">
      <template #trigger>
        <Button variant="destructive" class="p-1 h-fit" :disabled="!selectionCount">删除(选中)</Button>
      </template>
      <span class="text-red-700 font-bold">
        确认要删除选中的 {{ selectionCount }} 个任务吗?
      </span>
    </ConfirmDialog>

    <Dialog>
      <DialogTrigger as-child>
        <Button class="p-1 h-fit" :disabled="!selectionCount">添加到分组(选中)</Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>加入分组</DialogTitle>
          <DialogDescription>
            <a href="/options.html#/h/group/list/" class="link">去创建分组</a>
          </DialogDescription>
        </DialogHeader>

        <TaskGroupQueryBox v-model="groupForAdd" type="house" />

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

  </div>

  <HouseTasksTable :data="data" :row-count="rowCount" :init-page-index="_pageIndex ? Number(_pageIndex) : undefined"
    :init-page-size="_pageSize ? Number(_pageSize) : undefined" @on-pagination-change="onPaginationUpdate"
    class="overflow-x-hidden" v-model:row-selection="rowSelection" />

</template>

<style scoped></style>