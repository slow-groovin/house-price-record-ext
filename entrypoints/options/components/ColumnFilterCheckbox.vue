<script setup lang="ts">
import {Column, Table, VisibilityState} from "@tanstack/vue-table";

const columnVisibility = defineModel<VisibilityState>('visibility')
const props=defineProps<{
  table: Table<any>,
}>()
function toggleColumnVisibility(column: Column<any, any>) {

  columnVisibility.value = {
    ...(columnVisibility.value),
    [column.id]: !column.getIsVisible(),
  }
  console.log(column.getIsVisible(),column.id,toRaw(columnVisibility.value))

}

function toggleAllColumnsVisibility() {
  columnVisibility.value=props.table.getAllLeafColumns().reduce((acc, column) => {
    acc[column.id] = !column.getIsVisible()
    return acc
  }, {} as VisibilityState)
}
</script>

<template>
  <div class=" border border-black shadow rounded flex flex-row">
    <div class="px-1 border-b border-black">
      <label>
        <input
            type="checkbox"
            :checked="table.getIsAllColumnsVisible()"
            @input="toggleAllColumnsVisibility"
        />
        Toggle All
      </label>
    </div>

    <div
        v-for="column in table.getAllLeafColumns()"
        :key="column.id"
        class="px-1 "
    >
      <label>
        <input
            type="checkbox"
            :checked="column.getIsVisible()"
            @input="toggleColumnVisibility(column)"
        />

        {{ column.id }}
      </label>
    </div>
  </div>
</template>

<style scoped>

</style>