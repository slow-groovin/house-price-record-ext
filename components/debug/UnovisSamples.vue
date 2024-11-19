<script setup lang="ts">
import {VisAxis, VisLine, VisXYContainer} from '@unovis/vue'
import {ref} from 'vue'

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
</script>


<template>
  <VisXYContainer>
    <VisLine :data="data" :x="(d:DataRecord) => d.x" :y="(d:DataRecord) => d.y"/>
    <VisAxis type="x"/>
    <VisAxis type="y"/>
  </VisXYContainer>
  <div class="w-64 h-32">
    <VisXYContainer>
      <VisLine :data="data" :x="(d:DataRecord) => d.x" :y="(d:DataRecord) => d.y"/>
      <VisAxis type="x"/>
      <VisAxis type="y"/>
    </VisXYContainer>

  </div>

</template>

<style scoped>

</style>