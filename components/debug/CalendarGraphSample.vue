<template>
  <CalendarGraph :access-record="ar" class="my-4" />
</template>

<script setup lang="ts">


import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import {random,list} from "radash";

const ar=new AccessRecord(list(random(1,15)).map(i=>i+random(0,2^31)),new Date(2024,random(0,4),1))
</script>