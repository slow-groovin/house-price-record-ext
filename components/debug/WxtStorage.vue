<script setup lang="ts">
import {Button} from "@/components/ui/button";
import useWxtStorage from "@/composables/useWxtStorage";
import {useLocalStorage} from "@vueuse/core";
import {onMounted, ref} from "vue";
import {storage} from 'wxt/storage'

const options = ["local:", "session:", "sync:", "managed:"];
const selectedOption = ref<"local:" | "session:" | "sync:" | "managed:">("local:");


const testWxtStorageValue = ref('')
const testLocalStorageValue = ref('')
const {state: testReactiveWxtStorageValue, isReady, isLoading} = useWxtStorage('local:testReactiveWxtStorageValue')


const testUseLocalStorageValue = useLocalStorage('testUseLocalStorageValue', 'not_exist')

function set() {
  // @ts-ignore
  storage.setItem(selectedOption.value + 'testWxtStorage', new Date().toLocaleString())
}

function get() {
  // @ts-ignore
  storage.getItem(selectedOption.value + 'testWxtStorage', {fallback: 'not_exist'}).then(n => testWxtStorageValue.value = n)
}

const allValue = ref<Record<string, any>>({})

function getAll() {
  allValue.value = {}

  //@ts-ignore
  chrome.storage.local.get(null, function (items) {
    allValue.value = items
  });
}

function setLocalStorage() {
  localStorage.setItem('testWxtStorage1', new Date().toLocaleString())
}

function getLocalStorage() {
  testLocalStorageValue.value = localStorage.getItem('testWxtStorage1') ?? "not_exist"
}

onMounted(()=>{
  getAll()
})
</script>

<template>

  <div class="c-block">
    <h1>wxt-storage</h1>
    <div>
      <label
        v-for="option in options"
        :key="option"
        class="radio-label"
      >
        <input
          type="radio"
          :value="option"
          v-model="selectedOption"
        />
        {{ option }}
      </label>
      <p>Selected: {{ selectedOption }}</p>
    </div>

    <Button @click="set">wxt-storage: set {{ selectedOption }}</Button>
    <Button @click="get">wxt-storage: get {{ selectedOption }}</Button>
    <div>
      {{ selectedOption }}:testWxtStorage {{ testWxtStorageValue }}
    </div>

    <Button @click="getAll">get all</Button>
    <details open>
      <summary>storage all value</summary>
      <pre>{{ allValue }}</pre>
    </details>
  </div>

  <div class="c-block">
    <h1>localStorage</h1>
    <Button @click="setLocalStorage">set localStorage.testWxtStorage1 (of This page)</Button>
    <Button @click="getLocalStorage">get localStorage.testWxtStorage1 (of This page)</Button>
    <div>
      localStorage.testWxtStorage1 : {{ testLocalStorageValue }}
    </div>
  </div>

  <div class="c-block">
    <h1>reactive value</h1>
    <div>
      <Button @click="testUseLocalStorageValue=new Date().toLocaleString()">set testUseLocalStorageValue</Button>
      testUseLocalStorageValue: {{ testUseLocalStorageValue }}
    </div>
    <div>
      <Button @click="testReactiveWxtStorageValue=new Date().toLocaleString()">set testReactiveWxtStorageValue</Button>
      testReactiveWxtStorageValue: {{ testReactiveWxtStorageValue }}, isLoading: {{ isLoading }}, isReady:{{ isReady }}
    </div>
  </div>


</template>

<style scoped>

</style>