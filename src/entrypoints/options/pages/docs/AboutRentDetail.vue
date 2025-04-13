<script setup lang="ts">

</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex gap-4">
      <a href="https://real-price.api2o.com/" class="link text-lg" target="_blank">官方网站</a>
    </div>

    <div>
      <h2>这个插件是干什么的?</h2>
      帮助用户(您)方便地收集关注范围内的小区/房源状态, 记录价格/状态变动数据, 分析和展示历史数据<br />

    </div>



    <div>
      <h2>这个插件工作的本质是什么</h2>
      <span class="italic text-sm underline">它相当于替代用户完成了这样的手工过程:</span> 打开关注的小区/房源的页面,
      查看价格是否有变动, 查看状态是否有变动(哪些房源下架和上架和成交). 手动记录数据至Excel等软件, 然后通过图表展示历史数据的趋势.
    </div>

    <div>
      <h2>这个插件不能干什么?</h2>
      <ul>
        <li>获取海量数据</li>
        <li>不通过自己运行, 直接获取他人运行结果数据</li>
        <li>获取平台的非公开数据</li>
      </ul>
    </div>



    <div>
      <h2>数据存储介绍 </h2>
      <ul>
        <li>所有数据都都存储完全在浏览器内部的IndexedDB数据库, 完全是离线的</li>
        <li>正常使用情况下, 本插件产生的数据量不会很大 (比如您关注了100个小区, 每周运行一次, 使用一年后,
          不会超过500MB)
        </li>
        <li>可以使用导出功能导出数据</li>
      </ul>
    </div>

    <div>
      <h2>其它注意事项</h2>
      <ul>
        <li>功能的正常的运行受限于平台, 如果平台的网页更新, 可能会出现①功能不能正常运行②数据错乱的影响, 请①在任务运行结果确认页确认数据无误②即时更新插件③手动删除错误数据</li>
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
  @apply list-disc pl-6
}

li {
  @apply my-2
}
</style>
