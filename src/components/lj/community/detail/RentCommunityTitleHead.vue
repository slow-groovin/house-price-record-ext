<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue';
import { goRunRentCommunityTasksStartPage } from "@/entrypoints/reuse/rent-community-control";
import { RentCommunityTask } from "@/types/rent";
import { formatDistanceToNowHoursOrDays } from "@/utils/date";
import { genKeRentCommunityPageUrl } from "@/utils/lj-url";
import { cn } from "@/utils/shadcn-utils";
import { Icon } from "@iconify/vue";
import { HTMLAttributes, toRaw } from "vue";

const { community, class: classNames } = defineProps<{
  community: RentCommunityTask,
  class?: HTMLAttributes['class']
}>()

function openLjListUrl() {
  window.open(
    genKeRentCommunityPageUrl(community.city!, community.cid, 1, 'default'),
    '_blank', 'noreferrer')
}
</script>

<template>
  <div :class="cn('flex flex-row flex-wrap items-center gap-x-7', classNames)">
    <h1 class="text-3xl font-bold text-blue-500">
      🏙️ {{ community.name }}
    </h1>
    <div class=" px-2 py-1 ml-[-1em] font-bold text-sm  text-blue-600/60 border rounded-full shadow ">
      ● Running
    </div>


    <!--  <div class="min-w-10"></div>-->


    <Button class="py-0.5 pl-1 [&_svg]:size-6 gap-x-0 bg-blue-600" size="sm"
      @click="goRunRentCommunityTasksStartPage([toRaw(community)])">
      <Icon icon="solar:refresh-circle-linear" class="h-8 w-8" width="20px" height="20px" />
      <div class="text-base">运行任务</div>
    </Button>

    <div class="self-end text-sm font-bold  text-primary">
      最后运行于:
      {{ new Date(community.lastRunningAt).toLocaleDateString() }}
      ({{ formatDistanceToNowHoursOrDays(community.lastRunningAt) }})
    </div>


    <Button @click="openLjListUrl" class="self-end ml-[-1rem] text-sm  bg-blue-500/80   h-fit py-0 px-1  ">
      <Icon icon="tdesign:jump" />
      去访问网页
    </Button>


  </div>

</template>

<style scoped></style>