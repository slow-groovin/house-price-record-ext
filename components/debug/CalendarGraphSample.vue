<template>
  {{arKey}}
  <CalendarGraph :access-record="ar" class="my-4" :key="arKey" />

  <div class="p-2 border rounded">
    <DateRangePicker v-model:start-date="startDate" v-model:end-date="endDate"  @confirm="confirm"/>

  </div>
  {{startDate}} -> {{endDate}}
</template>

<script setup lang="ts">


import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import DateRangePicker from "@/components/DateRangePicker.vue";
import {CalendarDate, DateValue, getLocalTimeZone} from "@internationalized/date";
import {ref} from "vue";

const ar=ref(new AccessRecord(new Date(2023,2,3),new Uint32Array([0b1111110111,0b101010111]),))
const arKey=ref(1)

const startDate=ref<DateValue>(new CalendarDate(2024,1,1))

const endDate=ref<DateValue>(new CalendarDate(2024,1,2))

function confirm(){
  const s=startDate.value.toDate(getLocalTimeZone()) as Date
  const e=endDate.value.toDate(getLocalTimeZone())
  console.log(s,e)
  while(s.getTime()<=e.getTime()){
    ar.value.setAccessStatus(s,true)
    s.setDate(s.getDate()+1)
  }
  arKey.value++
  console.log(ar.value)
}
</script>