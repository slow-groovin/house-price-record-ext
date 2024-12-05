<script setup lang="ts">
import type { Column } from '@tanstack/vue-table'
import { computed, type HTMLAttributes } from 'vue'


import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Icon } from '@iconify/vue'

import { Separator } from '@/components/ui/separator'
import {cn} from "@/utils/shadcn-utils";

interface DataTableViewOptionsProps {
  // table: Table<any>,
  columns: Column<any>[]
}

const props = defineProps<DataTableViewOptionsProps & {class?: HTMLAttributes['class']}>()

const columns = computed(() => props.columns
  .filter(
    column =>
      typeof column.accessorFn !== 'undefined' && column.getCanHide() ,
  ))

const allColumnsVisible = computed(() => columns.value.every(column => column.getIsVisible()))

function toggleAllVisible(inputEvent:Event){
  columns.value.forEach(column => column.toggleVisibility((inputEvent.target as unknown as HTMLInputElement).checked))
}
</script>

<template>
  <DropdownMenu >
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="sm"
        :class="cn('ml-auto hidden h-8  lg:flex', props.class)"
      >
        <Icon icon="radix-icons:mixer-vertical" class="w-4 h-4 " />
        表头
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="ml-auto max-w-[150px] min-w-fit px-0">
      <div class="text-xs font-extralight" >
        <label>
          <input
            type="checkbox"
            :checked="allColumnsVisible"
            @input="toggleAllVisible"
          />
          全选
        </label>
      </div>
      <Separator class="w-full h-1 bg-neutral-300/60" orientation="horizontal"/>


      <div v-for="column in columns" :key="column.id"  class="border-b flex flex-nowrap">
        <input type="checkbox" id="visible"
               class=""
               :checked="column.getIsVisible()"
               @change="(e:Event)=>column.toggleVisibility((e.target as HTMLInputElement).checked)"
               :name="column.id" />
        <label for="scales"  class="capitalize">{{column.id}}</label>

      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>