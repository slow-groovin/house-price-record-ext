<script setup lang="ts">

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";

const props=defineProps<{
  setPageIndex: (index: number) => void
  setPageSize: (index: number) => void
  pagination: { pageIndex: number, pageSize: number },
  maxPage: number
}>()
const pageSizes = [10, 20, 30, 40, 50, 100, 200]

function calcShowedPageNumbers(curPage:number, maxPage:number):(number|'...')[]{
  const result:(number|'...')[]=[1,2,3,]
  if(curPage-4> (3+1)){
    result.push('...')
  }
  for (let i=Math.max(4,curPage-4);i<Math.min(maxPage-3,curPage+4);i++){
    result.push(i)
  }
  if(curPage+4<maxPage-4){
    result.push('...')
  }
  result.push(maxPage-3,maxPage-2,maxPage-1,maxPage)
  return result
}

function gotoPage(){
  props.setPageIndex(Number(document.getElementById('input-pageIndex')?.value))
}
</script>

<template>
  <div>
    <div class="flex items-center gap-2">
      <div
          v-for="page in calcShowedPageNumbers(pagination.pageIndex,maxPage)">
        <div v-if="page==='...'">
            {{page}}
        </div>
        <button
            v-else
            class="border rounded p-1"
            @click="() => setPageIndex(page)"
            :disabled="page===pagination.pageIndex"
            :class="{
              'bg-blue-500': page===pagination.pageIndex,
              'text-white': page===pagination.pageIndex,
            }"
        >
          {{ page }}
        </button>

      </div>


      <div>{{ maxPage }} pages</div>

      <div>
        <input type="number" id="input-pageIndex" class="max-w-10 border">
        <button @click="gotoPage" class="border">go</button>
      </div>

      <select
          class="border"
          :value="pagination.pageSize"
          @change="(e:any)=>setPageSize(Number(e.target.value))"
      >
        <option
            :key="pageSize"
            :value="pageSize"
            v-for="pageSize in pageSizes"
        >
          Show {{ pageSize }}
        </option>
      </select>
    </div>
  </div>
</template>

<style scoped>

</style>