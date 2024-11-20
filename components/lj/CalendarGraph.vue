<script setup lang="ts">
import type {HTMLAttributes} from 'vue';
import {AccessRecord} from "@/utils/lib/AcessRecord";
import {random} from "radash";
import {
  differenceInCalendarDays,
  eachMonthOfInterval,
  eachYearOfInterval, endOfMonth, getDaysInMonth,
  lastDayOfMonth,
  startOfDay,
  startOfMonth
} from "date-fns";

import SimpleTabsContainer from "@/components/layout/SimpleTabsContainer.vue";

interface Props {
  accessRecord?: AccessRecord;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
});

type MonthData={
  monthIndex:number,
  data:boolean[]
}
type YearDataMap={
  [year: number]:MonthData[]
}
/**
 * accessRecord-> 区间展示数据
 * 从今天往前算, 每年一个标签
 * 每月一个区间
 */
const accessRecord: AccessRecord = new AccessRecord(
    [0b111111111111, 51063, 2451, 3415, 514124, 5555, 41241, 14214, 1241.555, 124124.451, 21414.2],
    new Date(2022,0,1)
)
console.log(accessRecord.startDate)
console.log(accessRecord.getAccessStatus(new Date(2022,0,1)))
const startYear=accessRecord.startDate.getFullYear()
const thisYear=new Date().getFullYear()

const today=new Date()
console.log(today.getDate(),today.getDay(),new Date(today.setDate(1)).toLocaleString())
const result = eachYearOfInterval({
  start: accessRecord.startDate,
  end: new Date()
})
const years=result.map(year=>year.getFullYear()).reverse()
function getYearsTab(years:number[]){
  return years.map(year=>({
    name:year.toString(),
    label:year.toString()
  }))
}
const yearTabs=result.map(year=>({
  name:year.getFullYear().toString(),
  label:year.getFullYear().toString()
})).reverse()
console.log(result)

function getCalendarDataOfYear(year:number):MonthData[]{
  const months=eachMonthOfInterval({
    start: new Date(year,0,1),
    end: year==thisYear?new Date(): new Date(year,11,31)
  })

  const yearData:MonthData[]=[]
  for (let month of months) {
    const b=startOfMonth(month)
    const e=endOfMonth(month)
    const rangeResult=accessRecord.getAccessRange(b,e)
    if(rangeResult.length!==getDaysInMonth(month)){
      console.warn('rangeResult.length!==getDaysInMonth(month)', `${month.toLocaleDateString()} daysOfMonth: ${getDaysInMonth(month)}, result.Length:${rangeResult.length}`)
    }
    yearData.push({
      monthIndex:month.getMonth(),
      data:rangeResult
    })
  }
  // console.log(yearData)
  return yearData
}


const yearsData:YearDataMap={}
for (let date of result) {
  yearsData[date.getFullYear()]=getCalendarDataOfYear(date.getFullYear())
}
const diffDays=differenceInCalendarDays(new Date(),accessRecord.startDate)
console.log(diffDays)
const monthStart=new Date(today.setDate(1)/24*1000)

const sampleData = [
  {start: 0, end: 33, value: true},
  {start: 33, end: 35, value: false},
  {start: 35, end: 36, value: true},
  {start: 36, end: 45, value: false},

]
let index = 45
for (let lastValue = false; index < 365; lastValue = !lastValue) {
  const size = random(1, 35)
  sampleData.push({start: index, end: index + size, value: lastValue})
  index += size
}

const hoverDuration = ref<any | null>()

const array = new Array(100).fill(null).map(_ => (random(1, 20) % 2 != 1))

function getMonthDesc(day:Date){
  let monthNumber = day.getMonth()+1;
  return `${monthNumber}/${day.getDate()} ~ ${monthNumber}/${lastDayOfMonth(day).getDate()}`
}
</script>

<template>
  <div :class="cn('flex flex-col w-fit', props.class)">
    <SimpleTabsContainer :tabs="getYearsTab(years)">
      <template v-for="year in years" v-slot:[year]>
        <h2>{{year}}</h2>
        <div v-for="(month) in yearsData[year]" class="flex flex-row">
          <div class="border w-36">
            {{getMonthDesc(new Date(year,month.monthIndex,1))}}
          </div>

          <div class="flex flex-row gap-x-1">
            <div
                v-for="(item, index) in month.data"
                @mouseenter="hoverDuration=item"
                @mouseleave="hoverDuration=null"
                :class="cn(
            'h-6 w-2 rounded hover:border border-neutral-700',
            item ? 'bg-green-500' : 'bg-gray-300'
          )"
            />


          </div>

        </div>

      </template>
    </SimpleTabsContainer>

  </div>
</template>