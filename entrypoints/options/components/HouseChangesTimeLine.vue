<script setup lang="ts">
//
import {HouseChange, HouseStatusChange, HouseTask} from "@/types/lj";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import {onMounted, ref, watch} from "vue";
import TimelineItem from "@/components/TimelineItem.vue";
import PriceChangeBudget from "@/components/lj/house/PriceChangeBudget.vue";
import {scrollToId} from "@/utils/document";
import StatusChangeBudget from "@/components/lj/house/StatusChangeBudget.vue";
import {formatDistanceToNowHoursOrDays} from "@/utils/date";
import {cn} from "@/utils/shadcn-utils";
import {db} from "@/utils/client/Dexie";
import {Icon} from "@iconify/vue";
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";
import {storage} from "wxt/storage";


/*
ref definition
 */
const {data, rowCount, isShowDetail, type, class: classNames} = defineProps<{
  data: (HouseChange | HouseStatusChange)[],
  rowCount: number,
  isShowDetail?: boolean,
  type: 'price' | 'status',
  class?: string,
}>()
const deletedIds = ref<(number|undefined)[]>([])
const checkDisableConfirmDelete=ref(false)
// const {state:confirmDelete}=useWxtStorage('local:confirmDeleteChangeItem',true)
const confirmDelete=true
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


function updatePagination() {
  scrollToId('change-timeline')
  emit('onPaginationChange', pagination.value.pageIndex, pagination.value.pageSize)
}

//初始化默认查询
updatePagination()
/**
 * pagination end
 */

/*
data
 */
const hMap = ref<Record<string, HouseTask>>({})


async function queryDetailData() {
  console.log('[HouseChangesTimeLine.vue] queryDetailData()')
  //changes hid cid
  const hidList = Array.from(new Set(data.map(c => c.hid)))
  const houseTasks = await db.houseTasks.where('hid').anyOf(hidList).toArray()
  houseTasks.forEach(h => hMap.value[h.hid] = h)
}

function clearDetailData() {
  hMap.value = {}
}

/*
data END
 */

onMounted(() => {
  if (isShowDetail) {
    queryDetailData()
  }
  watch(() => data, () => {
    console.log('[HouseChangesTimeLine.vue]data changed.')
    if (isShowDetail) {
      queryDetailData()
    } else {
      clearDetailData()
    }
  })
  watch(() => isShowDetail, () => {
    if (!isShowDetail) return
    console.log('[HouseChangesTimeLine.vue]isShowDetail change to TRUE.', 'hMap::length', Object.values(hMap.value).length)

    if (Object.keys(hMap.value).length === 0) {
      queryDetailData()
    }
  })
})
console.log("[HouseChangesTimeLine.vue] init.")


function deleteChange(index: number) {
  if(checkDisableConfirmDelete.value){
    storage.setItem('local:confirmDeleteChangeItem',false)
  }
  const change = data[index]
  db.houseChanges.delete(change.id).then(() => {
    console.log(change.id, deletedIds.value)
    deletedIds.value.push(change.id)
    console.log(change.id, deletedIds.value)
  })

}

</script>

<template>
  <div id="change-timeline" :class="cn('flex flex-col flex-wrap  items-start justify-start ',classNames)">
    <TransitionGroup name="list" tag="div">
      <template v-for="(change,index) in data" :key="change.id">
        <TimelineItem v-if="!deletedIds.includes(change.id)" class="max-w-full" :spacing="80" :color="'bg-green-300'">
          <div class="flex flex-col  gap-2  mb-6 overflow-x-hidden  ">
            <div class="flex flex-row gap-2 items-center ">
              <div class="text-nowrap">
                ({{ formatDistanceToNowHoursOrDays(change.at) }}) {{ new Date(change.at).toLocaleString() }}
              </div>

              <a :href="'/options.html#/h/task/detail?id='+change.hid" target="_blank"
                 class="text-green-500 underline cursor-pointer">{{ change.hid }}</a>
              <div v-if="isShowDetail" class="text-nowrap overflow-hidden overflow-ellipsis"
                   :title="hMap[change.hid]?.name">
                {{ hMap[change.hid]?.name }} {{ hMap[change.hid]?.area }}㎡
              </div>

              <Icon v-if="!confirmDelete" @click="deleteChange(index)" icon="lets-icons:remove"  class="text-red-500 hover:bg-gray-200"/>
              <ConfirmDialog v-else @confirm="deleteChange(index)">
                <template #trigger>
                  <Icon icon="lets-icons:remove" class="text-red-500 hover:bg-gray-200"/>
                </template>
                删除这条任务?
<!--                <label class="flex items-center text-sm font-light italic">-->
<!--                  <Checkbox v-model:checked="checkDisableConfirmDelete"/>不再进行删除确认   (可以在'设置'页面中调整)-->
<!--                </label>-->
              </ConfirmDialog>

            </div>
            <div class="h-fit">
              <PriceChangeBudget v-if="type==='price'" :old-value="change.oldValue" :new-value="change.newValue"
                                 unit="万元"/>
              <StatusChangeBudget v-if="type==='status'" :old-value="change.oldValue" :new-value="change.newValue"/>
            </div>
          </div>
        </TimelineItem>
      </template>
    </TransitionGroup>
  </div>

  <PaginationComponent
    v-if="pagination"
    :set-page-index="(index:number)=>{pagination.pageIndex=index; updatePagination()}"
    :set-page-size="(size:number)=>{pagination.pageSize=size; updatePagination()}"
    :pagination="pagination"
    :row-count="rowCount"/>


</template>

<style scoped>
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

</style>