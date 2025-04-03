<script setup lang="tsx">
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Icon } from "@iconify/vue";

import { RentCommunityRecord, RentCommunityTask } from '@/types/rent';
import { cn } from "@/utils/shadcn-utils";
import { computed, HTMLAttributes } from "vue";

interface CardInfo {
  name: string,
  value: any,
  postfix?: string,
  icon?: string,
  type?: 'money' | 'count' | 'area' | 'date',
}

const { community, lastRecord, atBeforeLast, class: classNames } = defineProps<{
  community: RentCommunityTask,
  lastRecord?: RentCommunityRecord,
  atBeforeLast?: number //lastRecord之前的record的at
  class?: HTMLAttributes['class']
}>()



const mainInfo = computed<CardInfo[]>(() => {
  if (!community) return []
  return [
    { name: "城市", value: community.city, icon: "noto:cityscape" },
    { name: "在租", value: lastRecord?.count, postfix: '套', type: 'count' },
    { name: '均价', value: lastRecord?.avgPrice, postfix: '元', type: 'money' },
    { name: "任务创建时间", value: new Date(community.createdAt).toLocaleDateString(), type: 'date' },

  ]
})
const lastInfo = computed<CardInfo[]>(() => {
  if (!lastRecord) return []
  return [
    { name: '近期新上架数量', value: lastRecord?.added.length, type: 'count' },
    { name: '近期下架数量', value: lastRecord?.removed.length, type: 'count' },
    { name: '近期涨价数量', value: lastRecord?.priceUpList.length, type: 'count' },
    { name: '近期降价数量', value: lastRecord?.priceDownList.length, type: 'count' }
  ]
})

const lastPeriod = computed(() => {
  if (atBeforeLast && lastRecord?.at)
    return `从 ${new Date(atBeforeLast).toLocaleString()} 到 ${new Date(lastRecord.at).toLocaleString()}`
  else
    return ``
})


function icon(icon?: string, type?: 'money' | 'count' | 'area' | 'date') {
  if (icon) return icon
  switch (type) {
    case 'money':
      return 'mingcute:currency-cny-2-line'
    case 'count':
      return 'f7:number'
    case 'area':
      return 'material-symbols:house'
    case 'date':
      return 'clarity:date-line'
    default:
      return 'ant-design:number-outlined'
  }
}


function makeCard(cardInfo: CardInfo) {
  const iconStr = icon(cardInfo.icon, cardInfo.type)
  return <Card class="w-fit min-w-[10em]">
    <CardHeader class="p-2 flex flex-row items-center justify-between space-y-0 pb-2 ">
      <CardDescription> {cardInfo?.name}</CardDescription>
      <Icon icon={iconStr}></Icon>
    </CardHeader>
    <CardContent class="flex  text-center text-2xl font-bold">
      <div>
        {cardInfo.type === 'money' && <span>￥</span>}
        {cardInfo.value?.toLocaleString()}
        <span>{cardInfo.postfix}</span>
      </div>
    </CardContent>
  </Card>
}

</script>

<template>
  <div :class="cn('block', classNames)">
    <div :class="cn('flex flex-row gap-4 flex-wrap mb-5')">
      <Component :is="makeCard(item)" v-for="item in mainInfo" />
    </div>

    <div :class="cn('flex flex-row gap-4 flex-wrap')">
      <Component v-for="item in lastInfo" :is="makeCard(item)" :title="lastPeriod"
        class=" bg-gradient-to-tr from-green-100/50  to-yellow-200/30" />
    </div>
  </div>


</template>

<style scoped></style>