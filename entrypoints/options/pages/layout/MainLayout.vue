<script setup lang="ts">

import HeaderNav from "@/entrypoints/options/pages/nav/HeaderNav.vue";
import SidebarNav from "@/entrypoints/options/pages/nav/SidebarNav.vue";
import BackToTopBtn from "@/components/float/BackToTopBtn.vue";
import {Icon} from "@iconify/vue";
</script>

<template>
  <div id="__top_anchor"/>
  <div class="">
<!--    header 位置-->
    <HeaderNav :title="'Open Search'" version="0.1"  :links="[{text: 'about',href:'/options.html#/doc?q=about'}]">
      <template #navigation>
        <div class="flex flex-nowrap gap-4 text-white">
          <a class="flex items-center hover-link" href="/options.html#/startup"><Icon icon="carbon:course"/> 使用入门</a>
          <a class="flex items-center hover-link" href="/options.html#/about"><Icon icon="flat-color-icons:about"/> 关于</a>
          <a class="flex items-center hover-link" href="/options.html#/about"><Icon icon="codicon:feedback"/> 反馈</a>
        </div>

      </template>
    </HeaderNav>

    <div class="border-t">
      <div class="bg-background max-w-full">
        <div class="flex  w-[100vw]">
<!--          侧边栏位置-->
          <SidebarNav  class="sticky top-0 h-fit " />

<!--          内容位置-->
          <div class="w-[calc(100vw-14rem)]">
            <router-view/>
          </div>
        </div>
      </div>
    </div>
  </div>

  <BackToTopBtn />
</template>