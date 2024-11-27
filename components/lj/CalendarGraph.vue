<script setup lang="ts">
import {HTMLAttributes, reactive} from 'vue';
import {ref} from "vue";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import {
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfMonth,
  getDaysInMonth,
  lastDayOfMonth,
  min,
  startOfMonth
} from "date-fns";
import {cn} from '@/utils/shadcn-utils'

import SimpleTabsContainer from "@/components/layout/SimpleTabsContainer.vue";

interface Props {
  accessRecord: AccessRecord;
  class?: HTMLAttributes['class'];
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
});

type MonthData = {
  monthIndex: number,
  data: boolean[]
}
type YearDataMap = {
  [year: number]: MonthData[]
}

const {years, yearsData} = accessRecord2GraphData(props.accessRecord)
// const accessRecord: AccessRecord = new AccessRecord(
//     [0b111111111111, 51063, 2451, 3415, 514124, 5555, 41241, 14214, 1241.555, 124124.451, 21414.2,123.06],
//     new Date(2022,0,1)
// )
/**
 * accessRecord-> 区间展示数据
 * 从今天往前算, 每年一个标签
 * 每月一个区间
 */
function accessRecord2GraphData(accessRecord: AccessRecord) {
  let endDate = min([new Date(), accessRecord.getEndDate()]);
  const endYear = endDate.getFullYear()

  const yearsArray = eachYearOfInterval({
    start: accessRecord.startDate,
    end: endDate
  })

  const years = yearsArray.map(year => year.getFullYear()).reverse()

  const yearsData: YearDataMap = {}


  for (let date of yearsArray) {
    yearsData[date.getFullYear()] = getCalendarDataOfYear(date.getFullYear())
  }
  return {years, yearsData}

  function getCalendarDataOfYear(year: number): MonthData[] {
    const months = eachMonthOfInterval({
      start: new Date(year, 0, 1),
      end: year === endYear ? endDate : new Date(year, 11, 31)
    })

    const yearData: MonthData[] = []
    for (let month of months) {
      const b = startOfMonth(month)
      const e = endOfMonth(month)
      const rangeResult = accessRecord.getAccessRange(b, e)
      if (rangeResult.length !== getDaysInMonth(month)) {
        console.warn('rangeResult.length!==getDaysInMonth(month)', `${month.toLocaleDateString()} daysOfMonth: ${getDaysInMonth(month)}, result.Length:${rangeResult.length}`)
      }
      yearData.push({
        monthIndex: month.getMonth(),
        data: rangeResult
      })
    }
    return yearData.reverse()
  }

}


function getYearsTab(years: number[]) {
  return years.map(year => ({
    name: year.toString(),
    label: year.toString()
  }))
}

function getMonthDesc(day: Date) {
  let monthNumberStr = (day.getMonth() + 1).toString().padStart(2, '0');
  let firstDayStr = day.getDate().toString().padStart(2, '0');
  let lastDayStr = lastDayOfMonth(day).getDate().toString().padStart(2, ' ');
  return `${monthNumberStr}/${firstDayStr} ~ ${monthNumberStr}/${lastDayStr}`
}

/**tooltip**/
const container = ref<HTMLDivElement | null>(null);
const tooltipVisible = ref(false);
const tooltipContent = ref('');
const tooltipStyle = reactive({
  top: '0px',
  left: '0px',
});

const showTooltip = (event: MouseEvent, content: string) => {
  tooltipContent.value = content;
  tooltipVisible.value = true;

  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  // 动态计算 tooltip 位置，设置到目标元素上方
  tooltipStyle.top = `${rect.top - 20}px`; // 10px 上方间距
  tooltipStyle.left = `${rect.left}px`;
};

const hideTooltip = () => {
  tooltipVisible.value = false;
};
</script>

<template>
  <div
      v-if="tooltipVisible"
      :style="tooltipStyle"
      class="tooltip"
  >
    {{ tooltipContent }}
  </div>
  <div :class="cn('flex flex-col w-fit', props.class)">
    <SimpleTabsContainer :tabs="getYearsTab(years)">
      <template v-for="year in years" v-slot:[year]>
        <h2>{{ year }}</h2>
        <div class="flex flex-col gap-y-3" ref="container">
          <div v-for="(month) in yearsData[year]" class="flex flex-row gap-2">
            <div class="border  ">
              {{ getMonthDesc(new Date(year, month.monthIndex, 1)) }}
            </div>

            <div class="flex flex-row gap-x-0.5">
              <div
                  v-for="(item,index) in month.data"
                  @mouseenter="showTooltip($event, year+' '+(month.monthIndex+1)+'/'+(1+index))"
                  @mouseleave="hideTooltip()"
                  :class="cn(
            'h-6 w-1.5 rounded hover:border border-neutral-700',
            item ? 'bg-green-500' : 'bg-gray-300'
            )"/>
            </div>

          </div>

        </div>


      </template>
    </SimpleTabsContainer>

  </div>
</template>

<style>
.tooltip {
  position: fixed;
  padding: 3px 3px;
  border: darkgoldenrod 1px solid;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}
</style>