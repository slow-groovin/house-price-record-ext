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
const isTaskAutoRun=ref(false)
const isTaskAutoRunDone=ref(false)
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
  }
}

const {toast, toastType, toastMsg, toastKey} = useToastControl()




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
  toast.success('运行成功!')
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

function openAutoSetting() {
  sendMessage('openOptionPage', '/options.html#/settings', 'background')
}

async function getIsTaskAutoRun(){
  isTaskAutoRun.value=!!(await sendMessage('getStorageLocal','autoRunHouseTask','background'))

  if(isTaskAutoRun.value){
    setTimeout(()=>{
      updateTaskInPage().then(()=>{
        isTaskAutoRunDone.value=true
      })
    },5000)
  }
}

onMounted(async () => {
  console.log("[HouseContentUI.vue] mounted.")
  await getIsTaskAutoRun()
  await refresh()
})

</script>

<template>
  <div class="fixed top-24 right-0 w-fit">
    <ToastComponent :message="toastMsg" :type="toastType" :position-type="'block'" :key="toastKey"/>

    <Bubble v-on:mouseenter.once="isFocus=true" class="">

      <div v-if="houseTask" class="flex flex-col">
        <div class="border rounded mt-2 p-2">
          <div v-if="isTaskAutoRun && !isTaskAutoRunDone" class="flex ">
            <Icon icon="eos-icons:bubble-loading" class="text-primary w-6 h-6"/>
            开始自动运行任务
          </div>
          <div v-else-if="isTaskAutoRun && isTaskAutoRunDone" class="flex ">
            <a class="link " @click="openAutoSetting">自动</a>运行完毕, 任务已更新
            <Icon icon="icon-park-outline:success" class="inline-block w-6 h-6 text-green-500"/>
          </div>
        </div>



        <!--      <div class="flex flex-col">-->
        <span>
          任务已存在 <a @click="openOption" class="text-green-500 underline cursor-auto">去查看</a>
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

    </Bubble>
  </div>
</template>

<style scoped>

</style>