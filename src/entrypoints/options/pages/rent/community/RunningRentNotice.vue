<script setup lang="ts">

import { Separator } from "@/components/ui/separator";
import InfoHover from "@/components/information/InfoHover.vue";
import { Icon } from "@iconify/vue";
import { db } from "@/entrypoints/db/Dexie";
import { CommunityTask } from "@/types/lj";
import { genCommunityPageUrl } from "@/utils/lj-url";
import { ref } from 'vue'
import { useExtTitle } from "@/composables/useExtInfo";
import QuickLoginDesc from "../../../components/description/QuickLoginDesc.vue";
import Code from "@/components/information/Code.vue";
useExtTitle('运行前确认 | 批量运行小区任务')

const lastRunningTask = ref<CommunityTask>()
async function queryOne() {
  const lastOne = await db.communityTasks.orderBy('lastRunningAt').last()
  lastRunningTask.value = lastOne
}
queryOne()
</script>

<template>
  <div class="m-6 ">
    <div class="flex flex-wrap gap-4">
      <div class="p-2 border rounded w-fit ">
        <h1 class="text-2xl font-bold border-b">运行前确认</h1>
        登录beike(避免频繁拒绝访问/出现验证码导致失败)


      </div>
      <div class="p-2 border rounded w-fit">
        <h1 class="text-2xl font-bold border-b">任务运行说明</h1>
        <ol class="pl-4 mb-4 list-decimal flex flex-col gap-4">
          <li>点击侧边栏的"START"按钮, 开始批量运行任务</li>
          <li>标签页会依次自动打开, 自动记录信息后自动关闭页面</li>
          <li>全部运行完毕后,
            在结果页面进行<span class="text-green-500 font-bold">确认</span>数据才会存入浏览器数据库
          </li>

        </ol>
        <InfoHover>
          <template #trigger>
            <Code>运行过程示例</Code>
          </template>
          <template #default>
            <img src="/desc/rent.3.run-task.webp">
          </template>
        </InfoHover>
      </div>
    </div>


    <Separator class="my-6" />

    <h1 class="text-2xl font-bold border-b">注意事项</h1>
    <ol class="pl-4 list-decimal flex flex-col gap-4">
      <li>运行期间, 请不要关闭浏览器窗口和侧边栏</li>
      <li>新打开标签页, 某些浏览器内会强制自动成为浏览器当前活动页面,
        <span class="text-red-500 font-bold">因此在任务运行中您无法使用该浏览器正常进行其它浏览</span>
        <span class="text-sm italic">(这是无法更改的浏览器插件特性,
          <span class="text-green-700">您可以最小化浏览器并使用其它软件</span>
          ) </span>
      </li>
      <li>
        运行期间可能会由于访问频繁遭遇
        <span class="font-bold text-red-500">平台验证码</span>, 运行会自动暂停并提醒, 请按照提醒打开页面, 进行输入验证码或登录,
        完成之后确认能够正常访问的情况下, 点击"恢复"按钮继续运行
      </li>
      <li>如果频繁出现验证码, 请尝试修改运行前设置, 降低最大同时打开页面, 增大任务间隔时间,
        尽量每次只运行相同城市的任务
      </li>
    </ol>
  </div>

</template>

<style scoped></style>