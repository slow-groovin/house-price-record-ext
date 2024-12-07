<script setup lang="tsx">

import {Button} from "@/components/ui/button";
import Bubble from "@/components/lj/Bubble.vue";
import {onMounted, ref} from "vue";
import {HouseItem, HouseTask} from '@/types/lj'
import {parseHousePage} from "@/entrypoints/content/house-dom-parse";
import {sendMessage} from "webext-bridge/content-script";
import {Icon} from "@iconify/vue";
import {generateNormalPageUpdatePreview} from "@/entrypoints/reuse/house-control2";
import ToastComponent from "@/components/float/Toast.vue"
import {useToastControl} from "@/components/float/useToastControl";


const isFocus = ref(false)

const houseItem = ref<HouseItem>()
const houseTask = ref<HouseTask>()

async function refresh() {
  houseItem.value = await parseHousePage()
  console.log('parsed document, hid:', houseItem.value.hid)
  if (houseItem.value.hid) {
    const queryResult = await sendMessage('queryHouseTask', {hid: houseItem.value.hid}, 'background')
    if (queryResult.length > 1) {
      console.warn('has more than one tasks: ', queryResult.map(t => t.id))
    }
    houseTask.value = queryResult[0]
    console.log('query house task, hid:', houseTask.value.name)
  }
}

const {toast, toastType, toastMsg, toastKey} = useToastControl()


onMounted(async () => {
  console.log("[HouseContentUI.vue] mounted.")
  await refresh()
})


async function updateTaskInPage() {
  try {

    await refresh()
    if (!houseItem.value || !houseTask.value) {
      throw new Error("updateTaskInPage failed, task or pageItem is undefined.")
    }

    const houseNormalUpdatePreview = generateNormalPageUpdatePreview(houseItem.value, houseTask.value)
    await sendMessage('updateHouse', {houseNormal: houseNormalUpdatePreview, taskInDb: houseTask.value}, 'background')
    await refresh()
  } catch (e) {
    toast.error('更新失败, 发生错误:' + (e as Error)?.message)
    console.error(e)
  }
  toast.success('成功!')
}

async function createTsk() {
  if (!houseItem.value) {
    toast.warning('创建失败, 当前页面没有内容')
    return
  }
  try {
    const {reason} = await sendMessage('createHouseTask', houseItem.value, 'background')
    if (reason) {
      toast.error('创建失败:' + reason)
    } else {
      toast.success('创建成功')
      refresh()
    }
  } catch (e) {
    toast.error('创建失败, 发生错误:' + (e as Error)?.message)
    console.error(e)
  }
}

function openOption() {
  sendMessage('openOptionPage', '/options.html#/h/task/detail?id=' + houseItem.value?.hid, 'background')
}

</script>

<template>
  <div class="fixed top-24 right-0 w-fit">
    <ToastComponent :message="toastMsg" :type="toastType" :position-type="'block'" :key="toastKey"/>

    <Bubble v-on:mouseenter.once="isFocus=true" class="">
      <div v-if="houseTask" class="flex flex-col">
        <!--      <div class="flex flex-col">-->
        <span>
          任务已存在 <a @click="openOption" class="text-green-500 underline cursor-auto">查看</a>
        </span>

        <Button variant="default" @click="updateTaskInPage">
          <Icon icon="solar:refresh-circle-broken" class="w-6 h-6"/>
          手动运行
        </Button>

      </div>
      <div v-else class="flex flex-col">
        <div class="flex">
          尚未创建任务
          <button @click="refresh">
            <Icon icon="material-symbols-light:refresh"/>
          </button>
        </div>
        <Button @click="createTsk">
          创建任务
        </Button>
      </div>


      <div v-if=" houseTask" class="border rounded p-1">
        <div>创建时间: {{ new Date(houseTask.createdAt).toLocaleString() }}</div>
        <div>上次运行时间: {{ new Date(houseTask.lastRunningAt).toLocaleString() }}</div>
      </div>
      <Button @click="toast.error('test')">test</Button>

    </Bubble>
  </div>
</template>

<style scoped>

</style>