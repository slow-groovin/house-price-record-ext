<script setup lang="ts">
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from '@/components/ui/command'
import {Button} from '@/components/ui/button'

import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover'

import {Check} from 'lucide-vue-next'
import {onMounted, ref} from 'vue'
import {db} from "@/utils/client/Dexie";
import {cn} from "@/utils/shadcn-utils";
import {useInfiniteQuery} from '@tanstack/vue-query'
import {debounce} from "radash";
import {Icon} from "@iconify/vue";
import {useRoute} from "vue-router";
const {query:{cid,name}}=useRoute()

const value=defineModel<{cid:string,name:string}>( )
if(cid && name){
  value.value={cid:cid as string,name: name as string}
}
const open=ref(false)
const searchNameStr=ref('')
const queryData = async ( {pageParam=0}) => {
  if(searchNameStr.value){
    const res=await db.communityTasks
      .where('name')
      .startsWith(searchNameStr.value)
      .offset(pageParam * 10)
      .limit(10)
      .toArray()
    return res.map(c=>({
      name:c.name,
      cid:c.cid,
    }))
  }else{
    const res = await db.communityTasks.toCollection()
      .offset(pageParam * 10)
      .limit(10)
      .toArray()
    return res.map(c=>({
      name:c.name,
      cid:c.cid,
    }))
  }

}

//@ts-ignore
const {
  data,
  error,
  fetchNextPage,
  hasNextPage,
  isFetching,
  isFetchingNextPage,
  isLoading,

  isError,
} = useInfiniteQuery({
  queryKey: ['queryByCName',searchNameStr],
  queryFn: queryData,
  getNextPageParam: (lastPage, pages) => {
    if(lastPage.length && lastPage.length>=10)
      return pages.length
  },
})



onMounted(async ()=>{

})

function resetScroll(){

}

const onSearchTermChange=debounce({delay:1000},(v)=>searchNameStr.value=v)
</script>

<template>
  <Popover v-model:open="open"   @update:open="resetScroll()">
    <PopoverTrigger as-child>
      <div class="flex items-center ">
        <Button
          variant="outline"
          role="combobox"
          class="min-w-28 justify-between rounded-none "
          :class="value?.name?'':'font-light text-gray-300 '"
        >
          {{ value? value.name: '输入名称前缀查询...' }}



        </Button>
        <Icon v-if="value?.name" @click="value=undefined" icon="carbon:close-outline" class=" text-red-500 hover:bg-gray-100"></Icon>

      </div>

    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0">
      <Command v-model="value" @update:search-term.lazy="onSearchTermChange" :search-term="searchNameStr" :reset-search-term-on-blur="false">
        <CommandInput placeholder="输入名字前缀..." class=""/>

        <CommandEmpty>没有名字. {{searchNameStr}} </CommandEmpty>
        <CommandList ref="scrollContainer" id="scrollContainer" class="scrollContainer">
          <CommandGroup>
            <template v-if="data?.pages" v-for="(page,index) in data.pages" :key="index">
              <CommandItem
                v-for="item in page"
                :value="item"
                @select="open=false"
              >
                <Check
                  :class="cn(
                  'mr-2 h-4 w-4',
                  value?.name === item?.name ? 'opacity-100' : 'opacity-0',
                )"
                />
                {{ item?.name }}
              </CommandItem>
            </template>
            <Button @click="fetchNextPage" :disabled="!hasNextPage" class=" mx-5">加载更多</Button>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

<style scoped>

</style>