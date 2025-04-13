<script setup lang="ts">
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Button } from '@/components/ui/button'

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check } from 'lucide-vue-next'


import { computed, onMounted, ref } from 'vue'
import { cn } from "@/utils/shadcn-utils";
import { debounce } from "radash";
import { Icon } from "@iconify/vue";
import { useRoute } from "vue-router";
import { TaskGroup2 } from "@/types/group";
import { db } from "@/entrypoints/db/Dexie";

const value = defineModel<{ groupId: number, name: string }>()
const props = defineProps<{
  initialGroupId?: number
}>()
const data = ref<TaskGroup2[]>([])
const open = ref(false)
const searchNameStr = ref('')

async function queryInitialData() {
  //console.log(props.initialGroupId)
  if (!props.initialGroupId) return
  data.value = await db.taskGroups.where({ 'id': props.initialGroupId }).toArray()

  value.value = {
    groupId: props.initialGroupId,
    name: data.value[0]?.name,
  }
}

async function queryData() {
  data.value = await db.taskGroups.toArray()
}

const searchData = computed(() => {
  if (searchNameStr.value) {
    return data.value.filter((item) => item.name.includes(searchNameStr.value))
  } else {
    return data.value
  }
})


onMounted(async () => {
  await queryInitialData()  //没有作用,因为先于queryCondition渲染
  queryData()
})

function resetScroll() {

}

const onSearchTermChange = debounce({ delay: 1000 }, (v) => searchNameStr.value = v)
</script>

<template>
  <Popover v-model:open="open" @update:open="resetScroll()">
    <PopoverTrigger as-child>
      <div class="flex items-center ">
        <Button variant="outline" role="combobox" class="min-w-28 justify-between rounded-none "
          :class="value?.name ? '' : 'font-light text-gray-300 '">
          {{ value ? value.name : '' }}


        </Button>
        <Icon v-if="value?.name" @click="value = undefined" icon="carbon:close-outline"
          class=" text-red-500 hover:bg-gray-100"></Icon>

      </div>

    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command v-model="value" @update:search-term.lazy="onSearchTermChange" :search-term="searchNameStr"
        :reset-search-term-on-blur="false">
        <CommandInput placeholder="输入名字..." class="" />

        <CommandEmpty>没有名字. {{ searchNameStr }}</CommandEmpty>
        <CommandList ref="scrollContainer" id="scrollContainer" class="scrollContainer">
          <CommandGroup>
            <template v-if="searchData" v-for="(item, index) in searchData" :key="index">
              <CommandItem :value="{ groupId: item.id, name: item.name }" @select="open = false">
                <Check :class="cn(
                  'mr-2 h-4 w-4',
                  value?.name === item?.name ? 'opacity-100' : 'opacity-0',
                )" />
                {{ item?.name }}
              </CommandItem>
            </template>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<style scoped></style>