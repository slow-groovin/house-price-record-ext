<script setup lang="ts">
import {Semaphore} from "@/utils/lib/Semaphore";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ref} from "vue";
import {browser} from "wxt/browser";
import {random} from "radash";

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
      const tab=await browser.tabs.create({url,active:false})

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


const url=ref('')
async  function testFetch(){
  console.log('fetch:',url.value)
  const rs=await fetch(url.value)
  console.log((await rs.text()).substring(0,100),rs.status,rs.url)
}


</script>

<template>
  <div class="c-block gap-4">
    <h1>Open Tabs</h1>
    <Button @click="logObj">logBrowser</Button>
    <Button @click="openTabs">Once Multiple Tabs With Semaphore </Button>
    <Input v-model="url" placeholder="Enter url"/>
    <Button @click="testFetch">testFetch</Button>

  </div>
</template>

<style scoped>

</style>