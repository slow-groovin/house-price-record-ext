<script setup lang="ts">
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useExtTitle } from "@/composables/useExtInfo";
import { db } from "@/entrypoints/db/Dexie";
import TaskGroupTable from "@/entrypoints/options/components/TaskGroupTable.vue";
import { goRunGroupTask } from '@/entrypoints/reuse/group-control';
import { TaskGroup2 } from '@/types/group';
import { Icon } from "@iconify/vue";
import { onMounted, ref, toRaw } from "vue";
import { toast } from "vue-sonner";
useExtTitle('任务分组')

const data = ref<TaskGroup2[]>([])

const inputName = ref('')


async function queryData() {
  data.value = await db.taskGroups.toArray()
}

async function createGroup() {
  await db.taskGroups.add({
    name: inputName.value, createdAt: Date.now(), keRentCidList: [], ljSellCidList: [], ljSellHidList: []
  })
  toast.success('创建成功')
  queryData()
}

async function goBeginGroupTasks(index: number) {
  goRunGroupTask(toRaw(data.value[index]))
}

onMounted(() => {
  queryData()
})
</script>


<template>
  <h1 class="text-2xl font-bold my-4">任务分组</h1>
  <div class="flex">

    <Dialog>
      <DialogTrigger as-child>
        <div class="flex flex-row items-center border hover:bg-gray-200 rounded-lg p-2 cursor-pointer">
          <Icon icon="icon-park-outline:add" class="text-green-500 w-8 h-8 " />
          创建分组
        </div>

      </DialogTrigger>
      <DialogContent class="w-fit">
        <DialogHeader>
          <DialogTitle>创建组</DialogTitle>
          <DialogDescription>创建一个任务组</DialogDescription>
        </DialogHeader>

        <Label class="flex gap-4 flex-nowrap items-center">
          名字:
          <Input v-model="inputName" class="max-w-[10rem]" />
        </Label>

        <DialogFooter class="justify-end">
          <DialogClose as-child>
            <Button type="button" variant="default" @click="createGroup">
              创建
            </Button>
          </DialogClose>

          <DialogClose as-child>
            <Button type="button" variant="destructive">
              取消
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>


  </div>
  <TaskGroupTable :data="data" @on-run-group="goBeginGroupTasks" />

</template>

<style scoped></style>