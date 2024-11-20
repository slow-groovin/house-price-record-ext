<script setup lang="ts">
import {VisAxis, VisLine, VisScatter, VisTooltip, VisXYContainer} from '@unovis/vue'
import {ref} from 'vue'
import {Scatter, StackedBar} from "@unovis/ts";

type DataRecord = { x: number, y: number }
const data = ref<DataRecord[]>([
  {x: 0, y: 0},
  {x: 1, y: 2},
  {x: 2, y: 1},
  {x: 3, y: 3},
  {x: 4, y: 4},
  {x: 5, y: 3},
  {x: 6, y: 7},
  {x: 7, y: 6},
  {x: 8, y: 5},
  {x: 9, y: 6},
  {x: 10, y: 5},
])

const changes = [
  {at: new Date('2023-04-01').getTime(), oldValue: 100, newValue: 110},
  {at: new Date('2023-05-01').getTime(), oldValue: 110, newValue: 130},
  {at: new Date('2023-05-03').getTime(), oldValue: 130, newValue: 120},
  {at: new Date('2023-05-11').getTime(), oldValue: 120, newValue: 125},
  {at: new Date('2023-07-28').getTime(), oldValue: 125, newValue: 115},
]

/**
 * 对中间的每个点添加前后的点
 * @param _changes
 * @param intervalDays
 */
function changesExpand(_changes: typeof changes, intervalDays: number = 1) {
  const result: typeof changes = []
  for (let i = 0; i < changes.length; i++) {
    const nextAt = changes[i].at + intervalDays * 24 * 60 * 60 * 1000
    const prevAt = changes[i].at - intervalDays * 24 * 60 * 60 * 1000
    if (i > 0 && nextAt > changes[i - 1].at + 2 * intervalDays * 24 * 60 * 60 * 1000) {
      result.push({at: prevAt, oldValue: 0, newValue: changes[i].oldValue})
    }
    result.push(changes[i])
    if (i < changes.length - 1 && nextAt < changes[i + 1].at - 2 * intervalDays * 24 * 60 * 60 * 1000) {
      result.push({at: nextAt, oldValue: 0, newValue: changes[i].newValue,})
    }
  }
  console.log(result.map(d => ({d: new Date(d.at).toLocaleString(), v: d.newValue})))
  return result
}

/**
 * tooltipTrigger数, 显示格式为 `<日期>: <数值>` 需满足x为日期
 */
const triggerWithDatePrefix = (d: any) => `<span class="text-green font-bold">${d.newValue}</span> @${new Date(d.at).toLocaleDateString()} `
const triggers = {
  [Scatter.selectors.point]: triggerWithDatePrefix,
  [StackedBar.selectors.bar]: triggerWithDatePrefix
}
const accessRecords = []


</script>


<template>

  <div class="c-block">
    <h1>basic</h1>
    <VisXYContainer>
      <VisLine :data="data" :x="(d:DataRecord) => d.x" :y="(d:DataRecord) => d.y"/>
      <VisAxis type="x"/>
      <VisAxis type="y"/>
    </VisXYContainer>
  </div>


  <div class="c-block w-56">
    <h1>limit style size(height can only set in container)</h1>
    <VisXYContainer class="h-56">
      <VisLine :data="data" :x="(d:DataRecord) => d.x" :y="(d:DataRecord) => d.y"/>
      <VisAxis type="x"/>
      <VisAxis type="y"/>
    </VisXYContainer>
  </div>

  <div class="flex flex-col items-center">
    <h1>house changes </h1>
    <VisXYContainer class="w-52" >
      <VisLine :data="changesExpand(changes)" :x="(d:any) => d.at" :y="(d:any) => d.newValue"/>


      <VisScatter :data="(changes)" :x="(d:any) => d.at" :y="(d:any) => d.newValue"
                  :label="(d:any) => d.newValue" :color="'rgba(0,239,55,0.93)'"/>

      <VisAxis :data="changes" type="x" tickTextAlign="left" :tickTextAngle="30" tickTextFitMode="wrap"
               tickTextTrimType="end" :minMaxTicksOnly="false"
               :x="(d:any) => d.at" :tickFormat="(d: number) => new Date(d).toLocaleDateString()"/>
      <VisAxis :data="changes" type="y"/>
      <VisTooltip :triggers="triggers"  />

    </VisXYContainer>
  </div>
</template>

<style scoped>

</style>