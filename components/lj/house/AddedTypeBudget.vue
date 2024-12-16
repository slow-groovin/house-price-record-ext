<script setup lang="ts">
import {HTMLAttributes} from "vue";
import {cn} from "@/utils/shadcn-utils";
import {TaskAddedType} from "@/types/lj";
import InfoHover from "@/components/InfoHover.vue";

const props=defineProps<{
  addedType:TaskAddedType
  class?:HTMLAttributes['class']
}
>()
</script>

<template>
  <div :class="cn('',props.class)">
    <template v-if="addedType===TaskAddedType.autoByCommunity">
      <div class="flex border-b p-2 rounded-lg text-blue-500">
        <div>小区任务自动添加</div>
        <InfoHover>
          运行小区任务并确认更新时, 对新上架房源进行自动添加任务
        </InfoHover>
      </div>
    </template>
    <template v-else-if="addedType===TaskAddedType.manual">
      <div class="flex border-b p-2 rounded-lg text-amber-500">
        <div>手动添加</div>
      </div>
    </template>
    <template v-else>
      <div class="flex border-b p-2 rounded-lg text-neutral-500">
        <div>未知</div>
      </div>
    </template>
  </div>

</template>

<style scoped>

</style>