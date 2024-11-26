<script setup lang="ts">

import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {list} from "radash";

const props=defineProps<{
  setPageIndex: (index: number) => void
  setPageSize: (index: number) => void
  pagination: { pageIndex: number, pageSize: number },
  rowCount: number,
}>()
const pageSizes = [10, 20, 30, 40, 50, 100, 200]

const maxPage=computed(()=>Math.ceil(props.rowCount/props.pagination.pageSize))
/**
 * Prompt: 生成显示的页码
 *
 * 根据当前页(curPage)和最大页(maxPage)，生成显示页码数组，显示规则为：
 * 1. 显示前3个页码
 * 2. 显示后3个页码
 * 3. 显示当前页前后X个页码 (共2X+1个页码)
 * 4. 如果无法显示的页码区间，使用'...'代替
 *
 * 关键步骤：
 * - 判断并处理边界情况（如：页码范围超过最大页数，或页码数过少）
 * - 动态计算显示的页码范围并进行合并
 * - 使用'...'代替无法显示的区间
 *
 * @param curPage 当前页码
 * @param maxPage 最大页码
 * @returns 显示的页码数组，可以包含数字或'...'表示省略页码
 */
function calcShowedPageNumbers(curPage: number, maxPage: number): (number | '...')[] {
  // 定义前后显示的页码数，X为3
  const X = 3;
  const result: (number | '...')[] = [];

  // 如果最大页码少于或等于6，则显示所有页码
  if (maxPage <= 6)  return list(1,maxPage)

  // 显示前3个页码
  for (let i = 1; i <= 3; i++) {
    result.push(i);
  }
  // 判断是否需要省略前中间的页码区间
  if (curPage - X > 4) {
    result.push('...');
  }

  // 显示当前页前后的X个页码
  for (let i = Math.max(curPage - X, 4); i <= Math.min(curPage + X, maxPage - 3); i++) {
    result.push(i);
  }

  // 判断是否需要省略后面的页码区间
  if (curPage + X < maxPage - 3) {
    result.push('...');
  }

  // 显示后3个页码
  for (let i = maxPage - 2; i <= maxPage; i++) {
    result.push(i);
  }

  return result;
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


      <div>共 {{ rowCount }} 个</div>

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