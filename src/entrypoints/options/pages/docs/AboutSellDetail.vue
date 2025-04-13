<script setup lang="ts">
import InfoHover from "@/components/information/InfoHover.vue";
import { Icon } from "@iconify/vue";

</script>

<template>
  <div class="flex flex-col gap-8">
    <div class="flex gap-4">
      <a href="https://real-price.api2o.com/" class="link text-lg" target="_blank">官方网站</a>
      <a href="/options.html#/startup" class="link text-lg">查看操作指南(跟随步骤)</a>
    </div>

    <div>
      <h2>这个插件是干什么的?</h2>
      帮助用户(您)方便地收集关注范围内的小区/房源状态, 记录价格/状态变动数据, 分析和展示历史数据<br />

    </div>


    <div>
      <h2>适合哪些群体?</h2>
      <ol>
        <li>买房方</li>
        <li>准备购买二手房, 正在关注房价趋势</li>
        <li>同时关注大量目标小区的, 希望批量地掌握价格和上下架动态</li>
        <li>觉得①城市统计数据 ②媒体/中介的消息 与自己的目标小区/房源的房价趋势有所差异,
          想要得到针对自己购房目标(区域、小区、房源)的实际、有效、一手的数据
        </li>
        <li>希望将关注的数据保存为历史, 以备后续查看</li>
      </ol>
    </div>


    <div>
      <h2>这个插件工作的本质是什么</h2>
      <span class="italic text-sm underline">它相当于替代用户完成了这样的手工过程:</span> 打开关注的小区/房源的页面,
      查看价格是否有变动, 查看状态是否有变动(哪些房源下架和上架和成交). 手动记录数据至Excel等软件, 然后通过图表展示历史数据的趋势.
    </div>


    <div>
      <h2>平台app也提供了类似的功能, 为什么不直接使用app或者直接询问中介? 为什么额外需要这个插件?</h2>
      <ol>
        <li>作为补充, 提供额外的信息展示: 上下架状态, 实际面积与单价计算...</li>
        <li>批量化: 中介不会无偿的提供给您批量的历史数据</li>
        <li>清晰: ①检索/排序 ②表格和图表化</li>
        <li>隐私: 您在使用app去看房比价时, 您的使用过程会被记录下来, 作为模型的数据用来分析您的价格底线</li>
        <li>真实: 自己记录的数据是绝对真实有效的</li>
      </ol>


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
      <h2>除了主要功能以外, 还有什么额外的功能? </h2>
      <ol>
        <li>请求拦截规则: 拦截平台的用户行为分析请求等 <a href="/options.html#/blocks" class="link">去查看</a></li>
      </ol>
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
