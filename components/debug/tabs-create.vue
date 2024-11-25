<script setup lang="ts">
import {Semaphore} from "@/utils/lib/Semaphore";
import {Button} from "@/components/ui/button";

function openTabs() {
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

  const semaphore = new Semaphore(5)
  urls.forEach(url => {
    console.log("forEach:",url)
    new Promise(async (resolve) => {
      await semaphore.take()
      const a = browser.tabs.create({url},(tab)=>{
        console.log('tab',tab)
        const wait=rand(1000, 6000)
        setTimeout(async () => {
          console.log(`after ${wait}ms free:`, url)
          browser.tabs.remove([tab.id as number])
          semaphore.free()
          resolve(true)
        }, wait)
      });

      console.log('take suc', url,a)


    })
  });
  console.log('DONE')
}

function logObj(){
  console.log('browser:',browser)
  console.log('chrome:',chrome)

}
</script>

<template>
  <div class="c-block gap-4">
    <h1>Open Tabs</h1>
    <Button @click="logObj">logBrowser</Button>
    <button @click="openTabs">Once Multiple Tabs</button>
  </div>
</template>

<style scoped>

</style>