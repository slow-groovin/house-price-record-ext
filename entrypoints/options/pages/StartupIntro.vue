<script setup lang="ts">
import InfoHover from "@/components/InfoHover.vue";
import {Icon} from "@iconify/vue";

const extName = import.meta.env.VITE_EXT_NAME
</script>

<template>
  <h1 class="text-3xl font-bold border-b my-6">使用入门</h1>
  <div class="flex flex-col gap-8">

    <div>
      <h2>这个插件是干什么的?</h2>
      帮助用户(您)方便地收集关注范围内的小区/房源状态, 记录价格/状态变动数据, 并分析和展示历史数据
      通过上下架动态, 价格变动历史等数据帮助用户获取更真实的二手房交易市场趋势
    </div>


    <div>
      <h2>适合哪些群体?</h2>
      <ol>
        <li>准备购买二手房, 正在关注房价趋势</li>
        <li>同时关注大量目标小区的, 希望批量地掌握价格和上下架动态</li>
        <li>觉得机构的数据报告和平台中介的消息与自己关注的小区/房源有差异,
          想要得到针对自己关注房源的实际有效的"小数据"
        </li>
        <li>希望将关注的数据保存为历史, 以备后续查看</li>
      </ol>
    </div>

    <div>
      <h2>新手入门</h2>
      <ol>
        <li>打开一个
          <InfoHover>
            <template #trigger>
              <div class="bg-gray-200 px-2 rounded inline-flex items-center">
                小区列表网页
                <Icon icon="icon-park-outline:point"/>
              </div>
            </template>
            <img src="/desc/community-login.jpg" alt="">
          </InfoHover>
        </li>
        <li>在页面内右侧, 点击
          <InfoHover>
            <template #trigger>
              <div class="bg-gray-200 px-2 rounded inline-flex items-center">
                添加任务按钮
                <Icon icon="icon-park-outline:point"/>
              </div>
            </template>
            <img src="/desc/community-list-create.jpg" alt="">
          </InfoHover>
        </li>
        <li>打开插件的
          <InfoHover>
            <template #trigger>
              <div class="bg-gray-200 px-2 rounded inline-flex items-center">
                后台页面
                <Icon icon="icon-park-outline:point"/>
              </div>
            </template>
            <div class="flex gap-2 max-w-[100vw]">
              <img src="/desc/click-plugin.jpg" alt="" class="flex-1 object-contain">
              <img src="/desc/click-plugin-popup.jpg" alt="" class="flex-1  object-contain">
            </div>
          </InfoHover>
          ,
          进入
          <InfoHover>
            <template #trigger>
              <div class="bg-gray-200 px-2 rounded inline-flex items-center">
                小区任务列表
                <Icon icon="icon-park-outline:point"/>
              </div>
            </template>
            <div class="flex gap-2 max-w-[100vw]">
              <img src="/desc/enter-homepage.jpg" alt="" class="flex-1 object-contain">
            </div>
          </InfoHover>

        </li>
        <li>
          <InfoHover>
            <template #trigger>
              <div class="bg-gray-200 px-2 rounded inline-flex items-center">
                选中任务, 点击开始任务
                <Icon icon="icon-park-outline:point"/>
              </div>
            </template>
            <div class="flex gap-2">
              <img src="/desc/enter-c-list-page.jpg" alt="" class="flex-1 object-contain">
            </div>
          </InfoHover>
          , 跟随指引进行操作
          <InfoHover>
            <template #trigger>
              <div class="bg-gray-200 px-2 rounded inline-flex items-center">
                运行任务
                <Icon icon="icon-park-outline:point"/>
              </div>
            </template>
            <div class="flex gap-2">
              <img src="/desc/batch-start-page.jpg" alt="" class="flex-1 object-contain">
            </div>
          </InfoHover>

          ,
          等待运行结束后,
          <InfoHover>
            <template #trigger>
              <div class="bg-gray-200 px-2 rounded inline-flex items-center">
                确认结果进行保存
                <Icon icon="icon-park-outline:point"/>
              </div>
            </template>
            <div class="flex gap-2">
              <img src="/desc/batch-result-preview.jpg" alt="" class="flex-1 object-contain">
            </div>
          </InfoHover>

        </li>
        <li>在列表中,
          <InfoHover>
            <template #trigger>
              <div class="bg-gray-200 px-2 rounded inline-flex items-center">
                点开查看
                <Icon icon="icon-park-outline:point"/>
              </div>
            </template>
            <div class="flex gap-2">
              <img src="/desc/list-click-into.jpg" alt="" class="flex-1 object-contain">
            </div>
          </InfoHover>
          任务运行结果
        </li>
      </ol>
      <div>后续操作:
        <ul class="">
          <li>对您关注的的小区, 添加至任务, 每隔一段时间(几天/几周)运行一次</li>
          <li>单个房源的添加任务/运行任务操作与小区任务操作类似, 您可以针对房源进行操作</li>
          <li>把任务添加至分组, 提升操作效率</li>
          <li>随时查看历史数据和图表, 为您的交易决策提供有效支撑</li>
        </ul>
      </div>

    </div>
    <div>
      <h2>这个插件工作的本质是什么</h2>
      <span class="italic text-sm">它相当于替代用户完成了这样的手工过程:</span> 定期打开关注的小区/房源的页面,
      查看价格是否有变动, 查看状态是否有变动(哪些房源下架和上架和成交). 手动记录数据至Excel等软件, 然后通过图表展示历史数据的趋势.
    </div>


    <div>
      <h2>平台app也提供了类似的功能, 为什么不直接使用app或者直接询问中介? 为什么额外需要这个插件?</h2>
      <ol>
        <li>额外的功能: 上下架, 实际面积与单价计算...</li>
        <li>批量化: 中介不会无偿的提供给您批量的历史数据</li>
        <li>表格化, 图表化: 更加有效地展示数据</li>
        <li>隐私: 您在平台上的每一个操作都会被记录并用来分析您的价格底线</li>
        <li>真实: 自己记录的数据是绝对真实有效的</li>
      </ol>


    </div>

    <div>
      <h2>这个插件不能干什么?</h2>
      <ul>
        <li>获取超量所有的数据</li>
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
          不会超过100MB)
        </li>
        <li>可以使用导出功能导出数据</li>
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