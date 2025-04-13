<script setup lang="tsx">
import {toast} from "vue-sonner";
import {Button} from "@/components/ui/button";
import Toast from "@/components/float/Toast.vue";
import {createApp, ref} from "vue";



async function basic(){
  toast('BASIC', {
    description: 'basic',
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo'),
    },
  })
}

async function addSelfMadeToast(){
  // 1. 创建 Vue 应用并挂载到一个临时元素上
  const app = createApp(<Toast   message="addSelfMadeToast！"    type="success"      duration={5000}  class="text-lg font-bold"/>);
  const appElement = document.createElement('div');  // 创建一个临时的 DOM 元素
  app.mount(appElement);  // 将 Vue 组件挂载到该临时元素

  // 2. 将组件挂载的 DOM 元素添加到页面中的其他位置
  document.querySelector('#app')?.appendChild(appElement);
}

const showToast=ref(false)
const ToastTsx=<div>{ showToast && <Toast  message="hello" position="top-center" duration={30000}   />  } </div>
const ToastTsx1=<Toast message="ToastTsx1" position="top-right" />
</script>

<template>
  <div id="toast-area">
    <h1>sonner</h1>
    <h2><a href="https://vue-sonner.vercel.app/">https://vue-sonner.vercel.app/</a></h2>
    <div class="flex flex-col gap-3">
      <Button @click="() => toast('My first toast')">
        Give me a toast
      </Button>
      <Button @click="basic">basic</Button>
      <Button
        variant="outline" @click="() => {
        toast('Event has been created', {
          description: 'Sunday, December 03, 2023 at 9:00 AM',
          action: {
            label: 'Undo',
            onClick: () => console.log('Undo'),
          },
        })
      }"
      >
        Add to calendar
      </Button>

      <Button @click="addSelfMadeToast"> self made toast</Button>
      <Button @click="()=>showToast=!showToast"> show toast method 2: tsx</Button>


      showToast: {{showToast}}
      <ToastTsx/>
      <ToastTsx1/>
      <Toast :position-type="'block'" message="block" :type="'warning'" :duration="9999999999"/>
      <Toast
        message="INIT"
        type="success"
        :duration="5000"
        class="text-lg font-bold"
      />
    </div>

  </div>

</template>

<style scoped>

</style>