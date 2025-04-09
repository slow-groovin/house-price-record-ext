<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { RouterLink, useRoute } from 'vue-router'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/shadcn-utils'
import { random } from "radash";
import SimpleDrawer from "@/components/layout/SimpleDrawer.vue";
import { useDevSetting } from "@/entrypoints/reuse/global-variables";
import ModeSwitch from './ModeSwitch.vue'
import { useLocalStorage } from '@vueuse/core'
import { useMode } from '../../composables/useMode'

const { isDisguise, isDebug } = useDevSetting()

interface MenuItem {
  name: string
  icon?: string
  emoji?: string
  link: string
}

interface MenuGroup {
  name: string
  icon?: string
  emoji?: string
  menus: MenuItem[]
}

const { mode } = useMode()
const menuGroups = computed<MenuGroup[]>(() => {
  let _menuGroups: MenuGroup[] = [
    {
      name: '',
      menus: [
        { name: '📇首页', link: '/' }
      ]
    }
  ]
  if (mode.value === 'sell') {
    _menuGroups.push(
      {
        name: '二手房',
        menus: [
          { name: '🏙️小区列表', link: '/c/task/list' },
          { name: '🏠房源列表', link: '/h/task/list' },
          { name: '价格变更', link: '/h/task/change' },
          { name: '状态变更', link: '/h/task/status/change' },
        ]
      }

    )

  } else {
    _menuGroups.push(

      {
        name: '💸租房',
        menus: [
          { name: '小区列表📋', link: '/rent/c/task/list' },
          { name: '房源列表📋', link: '/rent/h/task/list' },
          { name: '价格变更✏️', link: '/rent/h/task/price/change' },
          { name: '状态变更✏️', link: '/rent/h/task/status/change' },
        ]
      }
    )
  }

  _menuGroups.push(
    {
      emoji: '🗂️',
      name: '',
      menus: [
        { name: '任务分组', link: '/group/list' },
      ]
    },
    {
      emoji: '⚙️',
      name: '️设置',
      menus: [
        { name: '设置', link: '/settings' },
        { name: '拦截规则', link: '/blocks' },
        { name: '导入/导出', link: '/export' },
      ]
    },
    {
      emoji: '',
      name: '️说明',
      menus: [
        { name: '操作指南', link: '/startup' },
        { name: '更新记录', link: '/CHANGELOG' },
        { name: '关于', link: '/about' },
      ]
    }
  )

  if (isDebug) {
    _menuGroups.unshift({
      name: 'DEBUG',
      menus: [
        { name: 'debug', link: '/debug' },
      ]
    })
  }
  if (isDisguise) {
    _menuGroups.forEach(v => v.name = random(1, 100) + '')
  }

  return _menuGroups

})



const route = useRoute();

const modeColor = computed(() => mode.value === 'sell' ? 'hsl(var(--primary) / 0.4)' : '#0085f230')

</script>

<template>
  <SimpleDrawer :class="cn('mr-4', $attrs.class ?? '')" default-open>
    <div class="min-w-[10rem] space-y-4 py-4 border-r  flex flex-col ">
      <ModeSwitch />
      <div v-for="group in menuGroups" :key="group.name" class="px-3 py-2">
        <h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">
          <Icon v-if="group.icon" :icon="group.icon" class="mr-2 h-4 w-4" />
          <span v-if="group.emoji"> {{ group.emoji }} </span>
          {{ group.name }}
        </h2>
        <div class="space-y-1">
          <template v-for="menu in group.menus" :key="menu.name">
            <a v-if="!menu.link.startsWith('/')" :href="menu.link" target="_blank" class="text-sm pl-4 py-2"> {{
              menu.name }}</a>
            <RouterLink v-else :to="menu.link">
              <Button variant="ghost" class="flex items-center justify-start font-normal w-full"
                :class="{ 'cur-select  border-l-2 border-black rounded-l-none': route.path === menu.link }">
                <Icon v-if="menu.icon" :icon="menu.icon" class="mr-2 h-4 w-4" />
                <span v-if="menu.emoji"> {{ menu.emoji }} </span>
                {{ menu.name }}

              </Button>

            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </SimpleDrawer>
</template>

<style lang="css" scoped>
div .cur-select {
  --mode-color: v-bind(modeColor);
  background-color: var(--mode-color);

}
</style>