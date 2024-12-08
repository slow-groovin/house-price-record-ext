<script setup lang="ts">
import {HouseTaskStatus} from "@/types/lj";
import {HStatusColor, HStatusDesc, HStatusZh} from "../../../reuse/enum-corespond";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card";

const statusList: HouseTaskStatus[] = [
  HouseTaskStatus.running,
  HouseTaskStatus.sold,
  HouseTaskStatus.miss
]
</script>

<template>
  <div class="flex gap-4">
    <div v-for="status in statusList" :key="status" class="flex items-center">
      <HoverCard :open-delay="10" :close-delay="10">
        <HoverCardTrigger class="text-inherit   no-underline">
          <div class="border-l-[.5rem] rounded pl-0.5  hover:bg-gray-200 " :class="`border-l-${HStatusColor[status]}`">
            {{ HStatusZh[status] }}
          </div>

        </HoverCardTrigger>
        <HoverCardContent class="w-fit p-0 ">
          {{HStatusDesc[status]}}
        </HoverCardContent>
      </HoverCard>

    </div>
  </div>
</template>

<style scoped>

</style>