<script setup lang="ts">
import {Button} from "@/components/ui/button";
import useWxtStorage from "@/composables/useWxtStorage";
import {useLocalStorage} from "@vueuse/core";
import {ref} from "vue";


const options = ["local:", "session:", "sync:", "managed:"];
const selectedOption = ref<"local:"| "session:"| "sync:"| "managed:" >("local:");


const testWxtStorageValue=ref('')
const testLocalStorageValue=ref('')
const {state:testReactiveWxtStorageValue, isReady,isLoading}=useWxtStorage('local:testReactiveWxtStorageValue')
const {state:debugEntryIndex}=useWxtStorage('local:debugEntryIndex',0, {immediate:true})

const testUseLocalStorageValue=useLocalStorage('testUseLocalStorageValue','not_exist')
function set(){
  // @ts-ignore
  storage.setItem(selectedOption.value+'testWxtStorage',new Date().toLocaleString())
}

function get(){
  // @ts-ignore
  storage.getItem(selectedOption.value+'testWxtStorage',{fallback:'not_exist'}).then(n=>testWxtStorageValue.value=n)
}

function setLocalStorage(){
  localStorage.setItem('testWxtStorage1',new Date().toLocaleString())
}

function getLocalStorage(){
  testLocalStorageValue.value=localStorage.getItem('testWxtStorage1')??"not_exist"
}


</script>

<template>

  <div  class="c-block">
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

    <Button @click="set">set {{selectedOption}}</Button>
    <Button @click="get">get {{selectedOption}}</Button>
    <div>
      {{selectedOption}}:testWxtStorage  {{ testWxtStorageValue }}
    </div>

  </div>
  <div class="c-block">
    <Button @click="setLocalStorage">set localStorage.testWxtStorage1 (of This page)</Button>
    <Button @click="getLocalStorage">get localStorage.testWxtStorage1 (of This page)</Button>
    <div>
      localStorage.testWxtStorage1 : {{testLocalStorageValue}}
    </div>
  </div>

  <div>
    <Button @click="testUseLocalStorageValue=new Date().toLocaleString()">set testUseLocalStorageValue</Button>
    testUseLocalStorageValue: {{testUseLocalStorageValue}}
  </div>
  <div>
    <Button @click="testReactiveWxtStorageValue=new Date().toLocaleString()">set testReactiveWxtStorageValue</Button>
    testReactiveWxtStorageValue: {{testReactiveWxtStorageValue}}, isLoading: {{isLoading}},  isReady:{{isReady}}
  </div>
  <div>
    debugEntryIndex: {{debugEntryIndex}}
  </div>
</template>

<style scoped>

</style>