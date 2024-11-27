<script setup lang="ts">
import {ref} from 'vue'
import {Icon} from '@iconify/vue'
import {RouterLink} from 'vue-router'
import {Button} from '@/components/ui/button'
import {cn} from '@/utils/shadcn-utils'
import {random} from "radash";
import SimpleDrawer from "@/components/layout/SimpleDrawer.vue";

interface MenuItem {
  name: string
  icon?: string
  emoji?:string
  link: string
}

interface MenuGroup {
  name: string
  icon?: string
  emoji?:string
  menus: MenuItem[]
}


const menuGroups = ref<MenuGroup[]>([
  {
    emoji: '🏠',
    name: '房源',
    menus: [
      { name: '概览',  link: '/#' },
      { name: '列表',  link: '/h/task/list' },
      { name: '变更',  link: '/h/task/change' },
    ]
  },
  {
    name: '小区',
    menus: [
      { name: '概览',  link: '/#' },
      { name: '列表',  link: '/c/task/list' },
    ]
  },
  {
    name: '⚙设置',
    menus: [
      { name: '自动化',  link: '/#' },
      { name: '参数',  link: '/#' },
      { name: '导入/导出',  link: '/#' },
    ]
  }
])

if(process.env.NODE_ENV=='development'){
  menuGroups.value.unshift({
    name: 'DEBUG',
    menus: [
      { name: 'debug',  link: '/debug' },
    ]
  })
}
if(import.meta.env.VITE_HIDE==='true'){
  menuGroups.value.forEach(v=>v.name=random(1,100)+'')
}

</script>

<template>
  <SimpleDrawer :class="cn('', $attrs.class ?? '')" default-open>
    <div class="space-y-4 py-4 border-r">
      <div v-for="group in menuGroups" :key="group.name" class="px-3 py-2">
        <h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">
          <Icon v-if="group.icon" :icon="group.icon" class="mr-2 h-4 w-4" />
          <span v-if="group.emoji"> {{group.emoji}} </span>
          {{ group.name }}
        </h2>
        <div class="space-y-1">
          <Button
              v-for="menu in group.menus"
              :key="menu.name"
              variant="ghost"
              class="w-full justify-start font-normal"
          >

            <RouterLink :to="menu.link" class="flex items-center">
              <Icon v-if="menu.icon" :icon="menu.icon" class="mr-2 h-4 w-4" />
              <span v-if="menu.emoji"> {{menu.emoji}} </span>

              {{ menu.name }}
            </RouterLink>
          </Button>
        </div>
      </div>
    </div>
  </SimpleDrawer>
</template>