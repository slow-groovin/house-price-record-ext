<script setup lang="ts">

import {Button} from "@/components/ui/button";
import {onMounted, ref, toRaw} from "vue";
import {browser} from "wxt/browser";
import ObjectTable from "@/components/table/ObjectTable.vue";
import {clearRules,  addRules} from "@/entrypoints/reuse/block"


const allRules=ref<any[]>(Object.values(rules).flat())
const activeRuleId=ref<number[]>([])
async function showRule(){
  const _rules = await browser.declarativeNetRequest.getDynamicRules()
  console.log("browser.declarativeNetRequest.getDynamicRules():",_rules)
  activeRuleId.value=_rules.map(r=>r.id)
}

function flatRuleObj(rule:any){
  return {
    id: rule.id,
    action: rule.action.type,
    initiatorDomains: rule.condition.initiatorDomains?.toString(),
    resourceTypes: rule.condition.resourceTypes?.toString().substring(0,20),
    urlFilter: rule.condition.urlFilter,
    regexFilter: rule.condition.regexFilter,
    priority: rule.priority,
  }
}

function addById(id:number){
  let find = toRaw(allRules.value.find(r=>r.id=id));
  if(!find){
    alert("no rule with id: "+id)
    return
  }
  browser.declarativeNetRequest.updateDynamicRules({
    addRules: [find]
  })
  .then(()=>{
    showRule()
  })
}

function removeById(id:number){
  browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [id]
  })
  .then(()=>{
    showRule()
  })
}

async function addAll(){
  await clearRules()
  await addRules()
  await showRule()
}
onMounted(()=>{
  showRule()
})


</script>

<template>
  <div class="c-block">
    <h1> rules</h1>
    <Button @click="showRule">refresh</Button>
    <Button @click="addAll">addAll</Button>
    <Button @click="clearRules();showRule();">removeAll</Button>
    <div class="flex flex-row flex-wrap gap-4">
      <div v-for="(rule,index) in allRules" class="border rounded-lg p-3 bg-blue-300">
        <h1>{{index}}</h1>
        <Button v-if="activeRuleId.includes(rule.id)" @click="removeById(rule.id)" >remove</Button>
        <Button v-else @click="addById(rule.id)">add</Button>
        <ObjectTable :data="flatRuleObj(rule)" />

      </div>
    </div>
  </div>
</template>

<style scoped>

</style>