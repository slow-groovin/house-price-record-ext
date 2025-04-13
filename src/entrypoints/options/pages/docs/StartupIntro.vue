<script setup lang="ts">
import Code from "@/components/information/Code.vue";
import { useMode } from "../../composables/useMode";
import { onMounted } from "#imports";
const { mode } = useMode()


</script>

<template>
  <h1 class="flex justify-between text-3xl font-bold border-b my-6">
    操作指南
    <div class="flex gap-4">
      <a href="https://real-price.api2o.com/" class="link text-lg" target="_blank">官方网站</a>
      <a href="/options.html#/about" class="link text-lg">更多详情</a>
    </div>

  </h1>
  <details :open="mode === 'sell'">
    <summary>二手房操作指南</summary>
    <div>
      <ol>
        <li>
          登录lianjia(目前列表页仅能在登录状态下访问)
          <img src="/desc/sell.1.login.webp" alt="" class="max-w-[900px]">
        </li>

        <li>
          打开一个<Code>二手房小区页面</Code>, 从右侧的插件浮窗页面中点击添加任务
          <img src="/desc/sell.2.add-task.webp" alt="">
        </li>

        <li>
          进入插件后台页, 插件图标(右键) -> 选项 -> 小区-列表
          <img src="/desc/sell.3.open-option.webp" alt="">
        </li>

        <li>
          选中刚才添加的小区任务, 点击<Code>运行任务(选中)</Code>打开运行任务窗口, 运行任务, 最终<Code>确认数据</Code>
          <img src="/desc/sell.4.run-task.webp" alt="">
        </li>


        <li>
          后续操作:
          <div class="border p-2 w-fit">
            <div>0. 在后台页面探索各种功能</div>
            <div>1. 每隔一段时间(几天/几周)运行一次, 价格/状态变更信息会被记录</div>
            <div>2. 查看历史数据和图表, 为您的交易决策提供有效支撑</div>
            <div>3. 把任务添加至分组, 提升操作效率</div>
            <div>4. 房源任务的使用过程与小区任务操作类似, 您可以针对房源进行操作</div>
          </div>
        </li>
      </ol>
    </div>

  </details>

  <details :open="mode === 'rent'">
    <summary>租房操作指南</summary>
    <div>
      <ol>
        <li>
          打开并登录贝壳租房 <a href="https://sh.zu.ke.com/zufang" class="link">https://sh.zu.ke.com/zufang</a>
          <br>
          (为什么需要登录? 避免频繁拒绝访问/出现验证码)
          <br>
          (为什么从贝壳而不是链家? 链家没有合租房源)

        </li>

        <li>
          打开一个<Code>租房小区列表页面</Code>, 从右侧的插件浮窗页面中点击添加任务
          <img src="/desc/rent.2.add-task.webp" alt="">
        </li>

        <li>
          进入插件后台页, 选中小区任务, 点击<Code>运行任务(选中)</Code>打开运行任务窗口, 运行任务, 最终<Code>确认数据</Code>
          <img src="/desc/rent.3.run-task.webp" alt="">
        </li>




        <li>
          后续操作:
          <div class="border p-2 w-fit">
            <div>0. 在后台页面探索各种功能</div>
            <div>1. 每隔一段时间(几天/几周)运行一次, 价格/状态变更信息会被记录</div>
            <div>2. 查看历史数据和图表</div>
            <div>3. 把任务添加至分组, 提升操作效率</div>
          </div>
        </li>
      </ol>
    </div>
  </details>
</template>

<style scoped lang="postcss">
h2 {
  @apply text-2xl font-bold
}

ol {
  @apply list-decimal pl-6
}

ul {
  @apply list-disc pl-6 my-16
}

li {
  @apply my-16 font-bold text-lg border p-2 rounded-lg w-fit
}
</style>
