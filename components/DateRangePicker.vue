<script setup lang="tsx">
import { Button } from '@/components/ui/button'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarDate, DateFormatter, type DateValue, getLocalTimeZone, type DateDuration } from '@internationalized/date'

import { type Ref, ref } from 'vue'
import { Icon } from '@iconify/vue'
import CalendarMonthYearSelect from '@/components/CalendarMonthYearSelect.vue'


const df = new DateFormatter('zh-CN', {
  dateStyle: 'long'
})

const today = new Date()

const emit = defineEmits<{
  confirm: [] // 具名元组语法
}>()

const startDateValue = ref<CalendarDate>()
const endDateValue = ref<CalendarDate>()

const confirmedStartDateValue= defineModel<CalendarDate>('startDate',{required:false})
const confirmedEndDateValue= defineModel<CalendarDate>('endDate',{required:false})

const errorMsg=ref('')

if(confirmedStartDateValue.value){
  startDateValue.value=confirmedStartDateValue.value
}else{
  startDateValue.value=new CalendarDate(today.getFullYear() - 1, today.getMonth(), today.getDay())
  confirmedStartDateValue.value=startDateValue.value
}
if(confirmedEndDateValue.value){
  endDateValue.value=confirmedEndDateValue.value
}else{
  endDateValue.value=new CalendarDate(today.getFullYear(), today.getMonth() + 1, today.getDay())
  confirmedEndDateValue.value=endDateValue.value
}
emit('confirm')



const PopDatePicker = (dateValue: Ref<DateValue|undefined>) => <Popover>
  <PopoverTrigger as-child>
    <Button variant="outline" class="w-[280px] justify-start text-left font-normal">
      <Icon icon="lucide:calendar" class="mr-2 h-4 w-4" />
      {dateValue.value ? df.format(dateValue.value?.toDate(getLocalTimeZone())) : '选择日期'}
    </Button>
  </PopoverTrigger>
  <PopoverContent class="w-auto p-0">
    <CalendarMonthYearSelect locale="zh-CN" v-model={dateValue.value as DateValue} initial-focus prevent-disselect/>
  </PopoverContent>
</Popover>



const StartDatePicker = PopDatePicker(startDateValue)

const EndDatePicker = PopDatePicker(endDateValue)


function setDateInterval(duration: DateDuration){
  startDateValue.value=endDateValue.value?.subtract(duration)
}

function confirmValue(){
  if(startDateValue.value && endDateValue.value){
    let compare = startDateValue.value?.compare(endDateValue.value)
    if(compare>=0){
      errorMsg.value='起始时间不能大于截止时间'
      return
    }
    confirmedStartDateValue.value=startDateValue.value
    confirmedEndDateValue.value=endDateValue.value
  }
  emit('confirm')
}

const durations=[
  {    text:'1周',duration:{weeks:1}  },
  {    text:'2周',duration:{weeks:2}  },
  {    text:'1个月',duration:{months:1}  },
  {    text:'3个月',duration:{months:3}  },
  {    text:'6个月',duration:{months:6}  },
  {    text:'1年',duration:{years:1}  },
  {    text:'2年',duration:{years:2}  },
]

</script>

<template>
  <div class="flex flex-col">
    <div class="text-sm text-red-500">{{errorMsg}}</div>
    <div class="flex gap-6 flex-wrap">
      <div class="flex flex-nowrap items-center">
        <div>起始时间:</div>
        <StartDatePicker/>
      </div>

      <div class="flex flex-nowrap items-center">
        <div>截止时间:</div>
        <EndDatePicker />
      </div>

      <div>
        <Button class="bg-blue-500" @click="confirmValue">应用时间范围</Button>
      </div>

      <Button
        v-for="duration in durations" @click="setDateInterval(duration.duration)"
        as="a" variant="link"  class="px-0 py-0">
        {{duration.text}}
      </Button>
    </div>


<!--    <div class="flex items-center mt-3 text-lg font-bold text-neutral-600  ">-->
<!--      当前时间范围: &nbsp;&nbsp;-->
<!--      <div class="border shadow rounded-lg p-2  w-fit">-->
<!--      {{confirmedStartDateValue}} 00:00:00 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-->
<!--      ~ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-->
<!--      {{confirmedEndDateValue}} 23:59:59-->
<!--      </div>-->
<!--    </div>-->


  </div>

</template>