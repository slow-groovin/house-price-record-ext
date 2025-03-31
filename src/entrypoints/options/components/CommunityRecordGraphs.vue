<script setup lang="tsx">
//
import {CommunityRecord} from "@/types/lj";
import {ComputedRef, MaybeRef, toRef} from "vue";
import {VisAxis, VisLine, VisScatter, VisStackedBar, VisTooltip, VisXYContainer} from '@unovis/vue'
import {
  computeDataSequence,
  expandYDomain, graphWidth,
  tickFormatDate,
  triggerWithDatePrefix,
  X,
  Y
} from "@/utils/unovis-data-transfer";
import {Scatter, StackedBar} from "@unovis/ts";
import {reactify} from "@vueuse/core";


const {data} = defineProps<{
  data: CommunityRecord[],
}>()

/*
1. onSellCount
2. avgTotalPrice
3. avgUnitPrice
4. upCount
5. downCount
6. addCount
7. downCount
 */


const onSellCountData = computeDataSequence(toRef(() => data), item => item.onSellCount)
const avgTotalPriceData = computeDataSequence(toRef(() => data), item => item.avgTotalPrice)
const avgUnitPriceData = computeDataSequence(toRef(() => data), item => item.avgUnitPrice)
const upCountData = computeDataSequence(toRef(() => data), item => item.priceUpList?.length)
const downCountData = computeDataSequence(toRef(() => data), item => item.priceDownList?.length)
const addCountData = computeDataSequence(toRef(() => data), item => item.addedItem?.length)
const removeCountData = computeDataSequence(toRef(() => data), item => item.removedItem?.length)

const computedDomain = reactify(expandYDomain)

const graphDataList: ({
  title: string,
  type: 'line' | 'stack bar',
  data: ComputedRef<{ x: number, y: number | undefined, index: number }[]>,
  yDomain: MaybeRef<[number, number?]>,
})[] = [
  {
    title: '在售数量',
    type: 'line',
    data: onSellCountData,
    yDomain: computedDomain(onSellCountData, 10),
  },
  {
    title: '平均总价',
    type: 'line',
    data: avgTotalPriceData,
    yDomain: computedDomain(avgTotalPriceData, 10),
  },
  {
    title: '平均平米均价',
    type: 'line',
    data: avgUnitPriceData,
    yDomain: computedDomain(avgUnitPriceData, 500),
  },
  {
    title: '涨价数量',
    type: 'stack bar',
    data: upCountData,
    yDomain: computedDomain(upCountData, 5),
  },
  {
    title: '降价数量',
    type: 'stack bar',
    data: downCountData,
    yDomain: computedDomain(downCountData, 5),
  },
  {
    title: '新上架数量',
    type: 'stack bar',
    data: addCountData,
    yDomain: computedDomain(addCountData, 5),
  },
  {
    title: '下架数量',
    type: 'stack bar',
    data: removeCountData,
    yDomain: computedDomain(removeCountData, 5),
  }

]

const triggers = {
  [Scatter.selectors.point]: triggerWithDatePrefix,
  [StackedBar.selectors.bar]: triggerWithDatePrefix
}


</script>

<template>
  <div class="flex flex-row flex-wrap gap-6">
    <div class="rounded-xl p-1 border min-w-[16rem] max-w-full" :style="{'width':graphWidth(data?.value?.length)}" v-for="{title,type,data,yDomain} in graphDataList" :key="title">
      <h3 class="text-xl font-bold text-center"> {{ title }}</h3>
      <VisXYContainer v-if="type==='line'" :data="data.value" :yDomain="yDomain" >
        <VisLine :x="X" :y="Y"/>
        <VisScatter :x="X" :y="Y" :color="'rgba(0,0,0,0)'"/>        <!-- 第一个scatter作用: 全部点可以tooltip(点本身透明)-->
        <VisScatter :x="X" :y="Y" :label="Y" :labelHideOverlapping="true"/>  <!-- 第二个scatter作用: 极值点上显示数值的label-->
        <VisAxis type="x" :x="X" :tickFormat="tickFormatDate" :minMaxTicksOnly="false"/>
        <VisAxis type="y"/>
        <VisTooltip :triggers="triggers"/>
      </VisXYContainer>

      <VisXYContainer v-else-if="type==='stack bar'" :data="data" :yDomain="yDomain">
        <VisScatter :x="X" :y="Y" :label="Y" color='rgba(0,0,0,0)' :labelPosition="()=>'top'" :size="0" />
        <!--          第一个scatter作用: 显示label数值(点本身透明)-->
        <VisStackedBar :x="X" :y="Y" :barPadding="0.1" :barMaxWidth="16" :barMinHeight1Px="true"/>
        <VisAxis type="x" :x="X" :tickFormat="tickFormatDate" :minMaxTicksOnly="false"/>
        <VisAxis type="y"/>
        <VisTooltip :triggers="triggers"/>
      </VisXYContainer>
    </div>
  </div>

</template>

<style scoped>

</style>