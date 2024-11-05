<script setup lang="ts">


async function log(){
  const oldRules=await browser.declarativeNetRequest.getDynamicRules()
  console.log(oldRules)
}
</script>

<template>

  <div class="c-block">
    <h1>Popup</h1>
    <div>

    </div>
  </div>
</template>

<style scoped>

</style>