<script setup lang="ts">
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from '@/components/ui/command'
import {Button} from '@/components/ui/button'

import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'
import {Check} from 'lucide-vue-next'


import {computed, onMounted, ref} from 'vue'
import {cn} from "@/utils/shadcn-utils";
import {debounce} from "radash";
import {Icon} from "@iconify/vue";
import {useRoute} from "vue-router";
import {TaskGroup} from "@/types/group";
import {db} from "@/utils/client/Dexie";

const {query: {groupId, name}} = useRoute()

const value = defineModel<{ groupId: number, name: string }>()
const props = defineProps<{ type?: 'community' | 'house' }>()
const data = ref<TaskGroup[]>([])
const open = ref(false)
const searchNameStr = ref('')

if (groupId && name ) {
  value.value = {
    groupId: Number( groupId as string),
    name: name as string,
  }
}

async function queryData() {
  if (props.type === 'house') {
    data.value = await db.houseTaskGroups.toArray()
  } else {
    data.value = await db.communityTaskGroups.toArray()
  }


}

const searchData = computed(() => {
  if (searchNameStr.value) {
    return data.value.filter((item) => item.name.includes(searchNameStr.value))
  } else {
    return data.value
  }
})


onMounted(async () => {
  queryData()
})

function resetScroll() {

}

const onSearchTermChange = debounce({delay: 1000}, (v) => searchNameStr.value = v)
</script>

<template>
  <Popover v-model:open="open" @update:open="resetScroll()">
    <PopoverTrigger as-child>
      <div class="flex items-center ">
        <Button
          variant="outline"
          role="combobox"
          class="min-w-28 justify-between rounded-none "
          :class="value?.name?'':'font-light text-gray-300 '"
        >
          {{ value ? value.name : '' }}


        </Button>
        <Icon v-if="value?.name" @click="value=undefined" icon="carbon:close-outline"
              class=" text-red-500 hover:bg-gray-100"></Icon>

      </div>

    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command v-model="value" @update:search-term.lazy="onSearchTermChange" :search-term="searchNameStr"
               :reset-search-term-on-blur="false">
        <CommandInput placeholder="输入名字..." class=""/>

        <CommandEmpty>没有名字. {{ searchNameStr }}</CommandEmpty>
        <CommandList ref="scrollContainer" id="scrollContainer" class="scrollContainer">
          <CommandGroup>
            <template v-if="searchData" v-for="(item,index) in searchData" :key="index">
              <CommandItem :value="{groupId:item.id,name:item.name}" @select="open=false">
                <Check
                  :class="cn(
                  'mr-2 h-4 w-4',
                  value?.name === item?.name ? 'opacity-100' : 'opacity-0',
                )"
                />
                {{ item?.name }}
              </CommandItem>
            </template>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<style scoped>

</style>