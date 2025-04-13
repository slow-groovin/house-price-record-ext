<script setup lang="tsx">

import { isCaptchaPage, isHousePage, isHouseSoldPage } from "@/utils/lj-url";
import { browser } from "wxt/browser";
import { nextTick, reactive, ref } from "vue";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "@vueuse/core";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { sendMessage } from '@@/messaging'
import ObjectTable from "@/components/table/ObjectTable.vue";
import NewPriceChangeBudget from "@/components/lj/house/NewPriceChangeBudget.vue";
import { Checkbox } from "@/components/ui/checkbox";


const curTabUrl = ref('')

async function updateCurTabUrl() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  curTabUrl.value = tabs[0].url ?? ''
}

const url = useLocalStorage('debug-fetch-url', '')

async function testFetch() {
  console.log('fetch:', url.value)
  try {
    const rs = await fetch(url.value, { redirect: 'follow' })
    console.log(rs.status, rs.url, rs)
    console.log('content SIMPLE:', (await rs.text()).substring(0, 100), rs)
  } catch (e) {
    console.log('error:', e)

  }
}

/**
 * tsx
 */
const Foo = (props: { msg: string }) => {
  return <div> Foo:{props.msg} </div>
}
const SimpleTsx = <div>SimpleTsx</div>
const StyleTsx = <div class="border p-2 m-3 bg-green-300">SimpleTsx</div>

/**
 * side panel
 */
async function openSidePanel() {
  if (typeof chrome !== "undefined" && chrome.sidePanel) {
    // Chrome 或 Edge
    console.log('[side-panel] is chrome!')
    const tabs = await browser.tabs.query({ active: true, currentWindow: true })

    await chrome.sidePanel.open({ tabId: tabs[0].id as number });
    await chrome.sidePanel.setOptions({
      path: "/sidepanel.html#/debug"
    })
  } else if (typeof browser !== "undefined" && browser.sidebarAction) {
    // Firefox
    console.log('[side-panel] is firefox!')

    browser.sidebarAction.setPanel({ panel: "sidebar.html#/debug" });
  } else {
    console.log("[side-panel]Side Panel API not supported in this browser.");
  }
}

function logBrowserSidePanelRelated() {
  //@ts-ignore
  console.log('browser.sidePanel', browser.sidePanel)
  console.log('browser.sidebarAction', browser.sidebarAction)

}

/**
 * side panel end
 */

/*
dialog
 */
async function dialogEnsure() {
  alert("dialog ensure!")
}

async function dialogAbort() {
  alert("dialog abort!")
}

/*
dialog end
 */

/*
message
 */
async function sendMsg() {
  const a = await sendMessage('simple', '')
  console.log(a, typeof a)
  a.echo()
}
/*
message end
 */

/*
obj of class reactive
 */
class A {
  constructor(public a: string, public b: number, public c: string) { }; rand() {
    console.log('begin random change field')
    setInterval(() => {
      this.a = Math.random().toString()
      this.c = Math.random().toString()
      this.b = Math.random() * 100
    }, 666)
  }
}
const a = new A('', 0, '')
const a1 = new A('ref(a1)', 0, '')
const a2 = new A('reactive(a2)', 0, '')
const refA = ref(a1)
const reactiveA = reactive(a2)

/**
 * checkbox test
 */
const checkboxTest = ref(true)
</script>

<template>
  <div class="flex flex-col gap-4">

    <div class="c-block">
      <h1> url </h1>
      <span>cur tab url: <span class="text-blue-500 underline">{{ curTabUrl }}</span></span>
      <Button @click="updateCurTabUrl">refresh</Button>
      <div> isHousePage: {{ isHousePage(curTabUrl) }}</div>
      <div> isSoldHousePage: {{ isHouseSoldPage(curTabUrl) }}</div>
      <div> isCaptchaPage: {{ isCaptchaPage(curTabUrl) }}</div>
    </div>
    <div class="c-block">
      <h1>fetch</h1>
      <Input v-model="url" placeholder="Enter url" />
      <Button @click="testFetch">testFetch</Button>
    </div>

    <div class="c-block">
      <h1>tsx</h1>
      <Foo msg="hello" />
      <SimpleTsx />
      <StyleTsx />

    </div>

    <div class="c-block">
      <h1>side panel</h1>
      <div class="flex flex-row gap-4 flex-wrap">
        <Button @click="logBrowserSidePanelRelated">log browser sidepanel obj</Button>
        <Button @click="openSidePanel">open side panel specific page</Button>

      </div>
    </div>

    <div class="">
      <h2>dialog</h2>
      <Dialog>
        <DialogTrigger>
          <Button>Edit Profile</Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose as-child>
              <Button @click="dialogEnsure">Save changes</Button>
              <Button @click="dialogAbort" variant="destructive">abort</Button>
            </DialogClose>

          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <div>
      <h1> does msg return serialized value or memory variable? </h1>
      <Button @click="sendMsg">send msg</Button>
      <h1> serialized value ✔ </h1>
    </div>

    <div class="c-block">
      <h1>reactive class obk</h1>
      <pre>{{ a }}</pre>
      <div>a.a:{{ a.a }} a.b:{{ a.b }} a.c:{{ a.c }}</div>
      <div>refA.a :{{ refA.a }} refA.b:{{ refA.b }} refA.c:{{ refA.c }}</div>
      <div>reactiveA.a :{{ reactiveA.a }} reactiveA.b:{{ reactiveA.b }} reactiveA.c:{{ reactiveA.c }}</div>
      <ObjectTable :data="refA" />
      <ObjectTable :data="reactiveA" />
      <div class="flex flex-row gap-4">
        <Button @click="() => a.rand()">a</Button>
        <Button @click="() => refA.rand()">refA</Button>
        <Button @click="() => reactiveA.rand()">reactiveA</Button>
        <Button @click="() => console.log(a, refA, reactiveA)">Log</Button>
        <Button @click="() => nextTick()">NextTick</Button>

      </div>

    </div>
    <div>
      1
      <ul class="list-disc pl-4">
        <li>1</li>
        <li>1</li>
        <li>1</li>
        <li>1</li>
        <li>1</li>
      </ul>

    </div>

    <NewPriceChangeBudget old-value="100" new-value="200" unit="万元" />
    <NewPriceChangeBudget old-value="210" new-value="200" unit="万元" />

  </div>

  <div>
    <Checkbox v-model:checked="checkboxTest"></Checkbox>checkboxTest:{{ checkboxTest }}
  </div>

</template>

<style scoped></style>