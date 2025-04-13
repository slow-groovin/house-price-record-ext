<script setup lang="ts">

import HeaderNav from "@/entrypoints/options/components/nav/HeaderNav.vue";
import SidebarNav from "@/entrypoints/options/components/nav/SidebarNav.vue";
import BackToTopBtn from "@/components/float/BackToTopBtn.vue";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import { Icon } from "@iconify/vue";
import { useExtInfo } from "@/composables/useExtInfo";

const { isDisguise } = useDevSetting()
const { name, version } = useExtInfo()
const _name = isDisguise ? 'Open Search' : name

</script>

<template>
  <div id="__top_anchor" />
  <div class="">
    <!--    header 位置-->
    <HeaderNav :title="_name" :version="version" :links="[{ text: 'about', href: '/options.html#/doc?q=about' }]">
      <template #logo>
        <img alt="logo" src="/icon/24.png" class="contrast-200 brightness-200" />
      </template>
      <template #navigation>
        <div class="flex flex-nowrap gap-4 text-white">
          <a class="flex items-center hover-link" href="/options.html#/startup">
            <Icon icon="carbon:course" /> 操作指南
          </a>
          <a class="flex items-center hover-link" href="/options.html#/about">
            <Icon icon="flat-color-icons:about" /> 关于
          </a>
          <a class="flex items-center hover-link" href="/options.html#/feedback">
            <Icon icon="codicon:feedback" /> 反馈
          </a>
          <a class="flex items-center hover-link" href="https://github.com/slow-groovin/house-price-record-ext"
            target="_blank">
            <Icon icon="akar-icons:github-fill" /> GitHub
          </a>
        </div>

      </template>
    </HeaderNav>

    <div class="border-t">
      <div class="bg-background max-w-full">
        <div class="flex  w-[100vw]">
          <!--          侧边栏位置-->
          <SidebarNav class="sticky top-0 h-fit " />

          <!--          内容位置-->
          <div class="w-[calc(100vw-14rem)]">
            <router-view />
          </div>
        </div>
      </div>
    </div>
  </div>

  <BackToTopBtn />
</template>