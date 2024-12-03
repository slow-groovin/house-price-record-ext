<script setup lang="ts">

import HeaderNav from "@/entrypoints/options/pages/nav/HeaderNav.vue";
import SidebarNav from "@/entrypoints/options/pages/nav/SidebarNav.vue";
import BackToTopBtn from "@/components/float/BackToTopBtn.vue";
</script>

<template>
  <div id="__top_anchor"/>
  <div class="md:hidden">

  </div>
  <div class="hidden md:block">
<!--    header 位置-->
    <HeaderNav :title="'Open Search'" version="0.1"  :links="[{text: 'about',href:'/about'}]"/>

    <div class="border-t">
      <div class="bg-background">
        <div class="grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8">
<!--          侧边栏位置-->
          <SidebarNav  class="col-span-1 sticky top-0 h-fit" />

<!--          内容位置-->
          <div class="col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6 ">
            <router-view/>
          </div>
        </div>
      </div>
    </div>
  </div>

  <BackToTopBtn />
</template>