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
      <div class="bg-background max-w-full">
        <div class="flex  w-[100vw]">
<!--          侧边栏位置-->
          <SidebarNav  class="sticky top-0 h-fit " />

<!--          内容位置-->
          <div class="max-w-[calc(100vw-14rem)]">
            <router-view/>
          </div>
        </div>
      </div>
    </div>
  </div>

  <BackToTopBtn />
</template>