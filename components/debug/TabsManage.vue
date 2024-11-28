<script setup lang="ts">
import {Semaphore} from "@/utils/lib/Semaphore";
import {Button} from "@/components/ui/button";
import {browser} from "wxt/browser";
import {random, sleep} from "radash";
import {BatchQueueExecutor} from "@/utils/lib/BatchQueueExecutor";
import {ref} from "vue";
import ObjectTable from "@/components/table/ObjectTable.vue";

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
    console.log("forEach:",url)
    new Promise(async (resolve) => {
      await semaphore.take()
      const tab=await browser.tabs.create({url,active:true})

      console.log('tab',tab)
      const wait=random(1000, 6000)
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

function logObj(){
  console.log('browser:',browser)
  console.log('chrome:',chrome)

}

const doneCount=ref(0)
const runningCount=ref(0)
const doneCost=ref(0)
const batchExecuteResult=ref<any[]>([])
async function BatchQueueExecutorSample(){
  const executor=new BatchQueueExecutor({
    interval: 0,
    retryTimes: 0,
    timeout: 0,
    maxConcurrent: 3,
    onDoneCountUpdateHook(): void {
      console.log('onDoneCountUpdateHook',executor.doneCount)
      doneCount.value=executor.doneCount
      doneCost.value=executor.doneCost
    },
    onRunCountUpdateHook(): void {
      runningCount.value=executor.runCount
    },
  })
  for (let url of urls) {
    executor.exec(async ()=>{
      const tab=await browser.tabs.create({url,active:true})
      console.log('tab',tab)
      const wait=random(1000, 6000)
      await sleep(wait)
      batchExecuteResult.value.push(`${wait}ms ${url}`)
      await browser.tabs.remove(tab.id as number)
    });
  }
}


</script>

<template>
  <div class="c-block gap-4">
    <h1>Open Tabs</h1>
    <Button @click="logObj">logBrowser</Button>
    <Button @click="openTabs">Once Multiple Tabs With Semaphore </Button>
    <Button @click="BatchQueueExecutorSample">Once Multiple Tabs With BatchQueueExecutor </Button>
    <div id="process-bar-area">
      <div> doneCount: {{doneCount}}</div>
      <div> runCount: {{runningCount}}</div>
      <div> doneCost: {{doneCost}}</div>
      <pre>{{batchExecuteResult}}</pre>

    </div>

  </div>
</template>

<style scoped>

</style>