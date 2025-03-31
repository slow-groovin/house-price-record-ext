<script setup lang="ts">
import { TaskGroup } from '@/types/group'
import TaskGroupTable from "@/entrypoints/options/components/TaskGroupTable.vue";
import { onMounted, ref, toRaw } from "vue";
import { db } from "@/entrypoints/db/Dexie";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "vue-sonner";
import { browser } from "wxt/browser";
import { useExtTitle } from "@/composables/useExtInfo";
import { goRunHouseTasksStartPage } from '@/entrypoints/reuse/house-control2';
useExtTitle('房源任务分组')

const data = ref<TaskGroup[]>([])

const inputName = ref('')


async function queryData() {
  data.value = await db.houseTaskGroups.toArray()
}

async function createGroup() {
  await db.houseTaskGroups.add({
    name: inputName.value, createdAt: Date.now(), idList: []
  })
  toast.success('创建成功,请去列表添加任务.')
  queryData()
}

async function goBeginGroupTasks(index: number) {
  const hidList = toRaw(data.value[index].idList)
  goRunHouseTasksStartPage(hidList)

  db.houseTaskGroups.update(data.value[index].id, {
    lastRunningAt: Date.now()
  })
}

onMounted(() => {
  queryData()
})
</script>


<template>
  <h1>房源任务组</h1>
  <div class="flex">

    <Dialog>
      <DialogTrigger as-child>
        <div class="flex flex-row items-center hover:bg-gray-200 rounded p-2">
          <Icon icon="icon-park-outline:add" class="text-green-500 w-8 h-8 " />
          添加任务
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
  <TaskGroupTable :data="data" type="house" @on-run-group="goBeginGroupTasks" />

</template>

<style scoped></style>