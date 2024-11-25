<template>
  <CalendarGraph :access-record="ar" class="my-4" />
</template>

<script setup lang="ts">


import CalendarGraph from "@/components/lj/CalendarGraph.vue";
import {AccessRecord} from "@/utils/lib/AcessRecord";
import {random,list} from "radash";
const ar=new AccessRecord(new Date(2024,2,3),new Uint32Array([0b1111110111,0b101010111]),)
</script>