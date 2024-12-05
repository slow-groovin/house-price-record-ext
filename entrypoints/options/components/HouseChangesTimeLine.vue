<script setup lang="ts">
//
import {CommunityTask, HouseChange, HouseStatusChange, HouseTask} from "@/types/lj";
import PaginationComponent from "@/entrypoints/options/components/PaginationComponent.vue";
import {onMounted, ref, watch} from "vue";
import TimelineItem from "@/components/TimelineItem.vue";
import PriceChangeBudget from "@/components/lj/house/PriceChangeBudget.vue";
import {scrollToId} from "@/utils/document";
import StatusChangeBudget from "@/components/lj/house/StatusChangeBudget.vue";
import {formatDistanceToNowHoursOrDays} from "@/utils/date";

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
const {data, rowCount,type} = defineProps<{
  data: (HouseChange|HouseStatusChange)[],
  rowCount: number,
  type: 'price'|'status',
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


function updatePagination(){
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
const dataWithDetail = ref<HouseChangeWithDetail[]>([])

// async function queryDetailData() {
//   const results: HouseChangeWithDetail[] = []
//   //changes
//   const changes = data
//
//
//   //houses info
//   const houseQueryCache = new QueryCache<HouseTask>()
//   const communityQueryCache = new QueryCache<CommunityTask>()
//   for (let i = 0; i < changes.length; i++) {
//     const change = changes[i]
//     const house = await houseQueryCache.getData('hid:' + change.hid, async () => {
//       return db.houseTasks.where('hid').equals(change.hid).first();
//     })
//     const community = await communityQueryCache.getData('cid:' + change.cid, async () => {
//       return db.communityTasks.where('cid').equals(change.cid).first()
//     })
//
//     results.push({
//       ...house,
//       ...community,
//       ...change,
//       houseName: house?.name,
//       communityName: community?.name,
//     } as HouseChangeWithDetail)
//   }
//
//   //communities info
//   dataWithDetail.value = results
// }

/*
data END
 */

onMounted(() => {

  watch(() => data, () => {
    console.log('data changed.',type)
    // queryDetailData()
  })
})


</script>

<template>
  <div class="flex flex-col items-start justify-start" id="change-timeline">
    <TimelineItem v-for="(change,index) in data" :key="index" class="w-[34rem] h-[6rem]" :spacing="100" :color="'bg-green-300'">
      <div class="grid grid-rows-2  gap-2  w-full h-fit">
        <div class="row-start-1 row-end-2  ">
          ({{ formatDistanceToNowHoursOrDays(change.at) }})   {{ new Date(change.at).toLocaleString() }}
          <a :href="'/options.html#/h/task/detail?id='+change.hid" target="_blank" class="text-green-500 underline cursor-pointer">{{ change.hid }}</a>
        </div>
        <div class="row-start-2 row-end-3 ">
          <PriceChangeBudget v-if="type==='price'" :old-value="change.oldValue" :new-value="change.newValue" unit="万元"/>
          <StatusChangeBudget v-if="type==='status'" :old-value="change.oldValue" :new-value="change.newValue"/>

        </div>
      </div>
    </TimelineItem>

  </div>

  <PaginationComponent
    v-if="pagination"
    :set-page-index="(index:number)=>{pagination.pageIndex=index; updatePagination()}"
    :set-page-size="(size:number)=>{pagination.pageSize=size; updatePagination()}"
    :pagination="pagination"
    :row-count="rowCount"/>


</template>

<style scoped>

</style>