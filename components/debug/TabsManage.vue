<script setup lang="ts">
import {Semaphore} from "@/utils/lib/Semaphore";
import {Button} from "@/components/ui/button";
import {browser} from "wxt/browser";
import {random, sleep} from "radash";
import {BatchQueueExecutor, Job, JobContext, NoRetryError, PauseError} from "@/utils/lib/BatchQueueExecutor";
import {reactive, ref, shallowRef} from "vue";
import ObjectTable from "@/components/table/ObjectTable.vue";
import BatchJobRunningStatusBar from "@/components/lj/BatchJobRunningStatusBar.vue";

const urls = [
  'https://www.example.com',
  'https://www.example2.com',
  'https://www.example3.com',
  'https://www.example4.com',
  'https://www.example5.com',
  'https://www.example6.com',
  'https://www.example7.com',
  'https://www.example8.com',
  'https://www.example9.com',
  'https://www.example10.com',
  'https://www.example11.com',
  'https://www.example12.com',

];

function openTabs() {
  const semaphore = new Semaphore(5)
  urls.forEach(url => {
    console.log("forEach:", url)
    new Promise(async (resolve) => {
      await semaphore.take()
      const tab = await browser.tabs.create({url, active: true})

      console.log('tab', tab)
      const wait = random(1000, 6000)
      setTimeout(async () => {
        console.log(`after ${wait}ms free:`, url)
        await browser.tabs.remove(tab.id as number)
        semaphore.free()
        console.log('take suc', url)
        resolve(true)
      }, wait)
    });
  });
  console.log('DONE')
}

async function openWindowAndOpenTabs() {
  const currentWindow = await browser.windows.getCurrent({populate: false})

  // 创建一个新窗口
  // const window = await browser.windows.create({
  //   url: "about:blank", // 新窗口初始打开的页面
  //   type: "normal", // 窗口类型：popup, normal, panel
  //   width: 800,
  //   height: 600,
  // });
  const window = await browser.windows.create({})
  console.log('window', window)

  const createTab = async () => await browser.tabs.create({windowId: window?.id, url: "about:blank", active: false,});

  await createTab()//1. 新窗口创建一个tab
  await sleep(500) //等待500ms
  await browser.windows.update(currentWindow!.id as number, {focused: true}) //回到(focus)之前窗口

  await sleep(500)
  await createTab()//2. 再次在新窗口中创建一个tab, 会回到(focus)新窗口, 这是chrome-ext固定的特性
  chrome.sidePanel.open({windowId: window!.id as number}) //为新窗口打开sidebar
}

function logObj() {
  console.log('browser:', browser)
  console.log('chrome:', chrome)

}

/**
 * Batch executor
 */
// const doneCount = ref(0)
// const runningCount = ref(0)
// const doneCost = ref(0)
//
// const avgCost = computed(() => (doneCost.value / doneCount.value).toFixed(0))
// const estimateCost = computed(() => (doneCost.value / doneCount.value * urls.length).toFixed(0))
const batchExecuteResult = ref<any[]>([])


const PREFIX = '[BatchQueueExecutorSample]'
let windowId = 0
let pauseOnce = true

function* generator(): IterableIterator<Job> {
  for (let url of urls) {
    console.log(PREFIX + '[generator]generate promise job:', url)
    async function newTabProcess(){
      await sleep(random(300, 600))
      if(url===urls[6]){
        throw new NoRetryError('url 6: throw NoRetryError')
      }
      return 'ok'
    }
    const promiseGetter: () => Promise<any> = () => (new Promise(async (resolve, reject) => {
      const tab = await browser.tabs.create({url, active: true, windowId: windowId})
      await sleep(random(300, 600))
      await browser.tabs.remove(tab.id as number)

      if(url===urls[5]){
        reject(new NoRetryError('url 5: reject NoRetryError'))
      }else if(url===urls[6]){
        // throw new NoRetryError('url 6: throw NoRetryError') //throw in promise async WILL not be CAUGHT!!!!
      }else if(url===urls[1] && pauseOnce){
        pauseOnce=false
        reject(new PauseError('url 1: reject PauseError'))
      }else if(url===urls[7]){
        reject(new Error('url 7: reject normal Error to retry'))
      }
      resolve('ok')
    }))
    const promiseGetter2=()=>newTabProcess()
    yield {
      context: {
        id: url,
      },
      promiseGetter: promiseGetter
    }
  }
}

const executor = ref<BatchQueueExecutor>(new BatchQueueExecutor(generator(), {
  interval: 1000,
  retryTimes: 3,
  // timeout: 0,
  log: true,
  maxConcurrent: 3,
  onDoneCountUpdateHook(): void {
    console.log(PREFIX, 'onDoneCountUpdateHook', executor.value.doneCount)
    // doneCount.value = executor.doneCount
    // doneCost.value = executor.doneCost
  },
  onRunCountUpdateHook(): void {
    // runningCount.value = executor.runCount
  },
  onFinishedHook(): void {
    console.log(PREFIX, 'on finished')
  },
  onJobStartHook(context: JobContext): void {
    batchExecuteResult.value.push({id: context.id, start: new Date(), end: undefined})
    console.log(PREFIX, 'onJobStartHook', context.id)
  },
  onJobEndHook(context: JobContext): void {
    const i = batchExecuteResult.value.findIndex(i => i.id === context.id)
    if (batchExecuteResult.value[i]) {
      batchExecuteResult.value[i] = {
        ...batchExecuteResult.value[i],
        end: new Date(),
      }
    }
    console.log(PREFIX, 'onJobEndHook', context.id)
  },
  onJobFailHook(context: JobContext, e): void {
    console.warn(PREFIX, 'onJobFailHook', context.id, e)
  },
  onJobRetryHook(context: JobContext, e): void {
    console.warn(PREFIX, 'onJobRetryHook', context.id, e)
  },

  onPauseHook(context: JobContext | undefined, e): void {
    console.warn(PREFIX, 'onPauseHook', context?.id, e)
    alert('Paused, please solve the problem and resume!' + context?.id)
  }
}))




async function BatchQueueExecutorSample() {

  // 创建一个新窗口
  await browser.windows.create({}).then(window=>{
    windowId=window.id as number
  })
  await executor.value.run()
  console.log(PREFIX, 'after await executor.run()')
  alert(PREFIX + "Done!")
}


</script>

<template>
  <div class="c-block gap-4">
    <h1>Open Tabs</h1>
    <Button @click="logObj">logBrowser</Button>
    <Button @click="openWindowAndOpenTabs">open Tabs and sidebar in new Window</Button>
    <Button @click="openTabs">Once Multiple Tabs With Semaphore</Button>

    <div class="border p-2 m-3">
      <Button @click="BatchQueueExecutorSample">Once Multiple Tabs With BatchQueueExecutor</Button>
      <Button @click="executor?.manualPause()">pause</Button>
      <Button @click="executor?.resume()">resume</Button>
      <BatchJobRunningStatusBar v-if="executor" :executor="executor" :total="urls.length"/>

    </div>


  </div>
</template>

<style scoped>

</style>