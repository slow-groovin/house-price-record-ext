<script setup lang="ts">
import Code from "@/components/information/Code.vue";

</script>

<template>
  <h1 class="flex justify-between text-3xl font-bold border-b my-6">
    使用入门
    <div class="flex gap-4">
      <a href="https://real-price.api2o.com/" class="link text-lg" target="_blank">官方网站</a>
      <a href="/options.html#/startup-detail" class="link text-lg">查看详细使用入门</a>
    </div>

  </h1>


  <div>

    <ol>
      <li>打开一个 <Code>小区页面</Code> 或者 <Code>小区的在售列表网页</Code>
        <div class="flex gap-4">
          <img src="/desc/community-home-page-jump.jpg" alt="">
          <img src="/desc/community-login.jpg" alt="">

        </div>

      </li>

      <li>在页面内右侧, 点击 <Code>添加任务按钮</Code>
        <img src="/desc/community-list-create.jpg" alt="">
      </li>

      <li>打开插件的 <Code>         后台页面       </Code>
        <div class="flex gap-2 max-w-[100vw]">
          <img src="/desc/click-plugin.jpg" alt="" class="flex-1 object-contain">
          <img src="/desc/click-plugin-popup.jpg" alt="" class="flex-1  object-contain">
        </div>
      </li>

      <li>
        进入 <Code>小区任务列表</Code>
        <img src="/desc/enter-homepage.jpg" alt="" class="flex-1 object-contain">
      </li>


      <li>
        <Code>选中任务, 点击运行任务</Code>
        <img src="/desc/enter-c-list-page.jpg" alt="" class="flex-1 object-contain">
      </li>

      <li> 跟随指引进行操作 <Code>运行任务</Code>
        <img src="/desc/batch-start-page.jpg" alt="" class="">
      </li>

      <li> 等待运行结束后, <Code>确认结果进行保存</Code>
        <img src="/desc/batch-result-preview.jpg" alt="" class="flex-1 object-contain">
      </li>


      <li>在列表中, <Code>点开查看</Code>任务运行结果
        <img src="/desc/list-click-into.jpg" alt="" class="flex-1 object-contain">
      </li>
    </ol>

    <a href="/options.html#/startup-detail" class="link">查看详细使用入门信息</a>

    <div>后续操作:
      <ul class="">
        <li>对您关注的的小区, 添加至任务, 然后每隔一段时间(几天/几周)运行一次</li>
        <li>房源任务的使用过程与小区任务操作类似, 您可以针对房源进行操作</li>
        <li>把任务添加至分组, 提升操作效率</li>
        <li>随时查看历史数据和图表, 为您的交易决策提供有效支撑</li>
      </ul>
    </div>

  </div>


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
  @apply my-16 font-bold text-lg border p-2 rounded-lg
}
</style>
