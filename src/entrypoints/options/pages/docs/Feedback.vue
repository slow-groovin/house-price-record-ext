<script setup lang="ts">
import { useExtInfo } from '@/composables/useExtInfo'
import { Waline } from '@waline/client/component';
import '@waline/client/style';

const { name, version } = useExtInfo()
</script>

<template>

  <section id="" class="rounded-xl  mt-2">
    <h1 class="text-4xl font-semibold text-center mb-4">
      反馈
    </h1>

    <div class="border p-2">
      <h2 class="text-2xl font-semibold">其它反馈方式</h2>
      <a href="https://real-price.api2o.com/docs/feedback.html" target="_blank" class="link">连接</a>

    </div>


    <div class="border p-2">
      <h2 class="text-2xl font-semibold">公共反馈</h2>
      <Waline serverURL="https://waline.api2o.com" :path="'house-price-ext-feedback' + version" />

    </div>

  </section>
</template>

<style scoped></style>