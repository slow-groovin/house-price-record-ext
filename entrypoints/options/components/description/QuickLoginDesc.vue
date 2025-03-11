<template>
  <div>
    <InfoHover>
      <template #trigger>
        <span class="bg-gray-200 border inline-flex  items-center">
          如何快捷登录?
          <Icon icon="icon-park-outline:point" />
        </span>
      </template>
      <template #default>
        <p class='italic'>链家的登陆状态失效时间很快, 最快速的登录方式是：</p>
        <ol class="list-decimal p-2">
          <li>打开链家首页<a href="https://lianjia.com" target="_blank" class="link">https://lianjia.com</a></li>
          <li>点击右上角登录, 选择"扫码登录"</li>
          <li>使用 【贝壳APP】, 进入 "我的" 标签页,  点击右上方扫码按钮,  进行扫码登录</li>
        </ol>
      </template>
    </InfoHover>
  </div>
</template>
<script setup lang="ts">
import InfoHover from '@/components/information/InfoHover.vue';

</script>