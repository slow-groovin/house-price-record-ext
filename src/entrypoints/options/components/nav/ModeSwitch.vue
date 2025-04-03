<template>
  <div class="inline-flex mx-auto items-center justify-center rounded-full bg-muted p-0.5 font-semibold border-2"
    :class="selectOption === 'sell' ? 'border-green-500' : 'border-blue-500'">
    <button :class="[
      'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm  ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      selectOption === options[0].value ? 'bg-green-700 text-white shadow-sm' : '',
    ]" @click="tryUpdateValue(options[0].value)">
      {{ options[0].label }}
    </button>
    <button :class="[
      'inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm  ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      selectOption === options[1].value ? 'bg-blue-700 text-white shadow-sm' : '',
    ]" @click="tryUpdateValue(options[1].value)">
      {{ options[1].label }}
    </button>
  </div>

  <Dialog :open="!!preparedSelectOption">
    <DialogContent class="sm:max-w-[425px]" :disable-close-button="true">
      <DialogHeader>
        <DialogTitle>确认切换到 {{options.find(o => o.value === preparedSelectOption)?.label}} 模式吗?</DialogTitle>
        <DialogDescription>
          当前页面将退出, 将会跳转到首页
        </DialogDescription>
      </DialogHeader>

      <div>
        <label>
          <input type="checkbox" v-model="notShowDialog"> 不再显示此对话框
        </label>
      </div>
      <DialogFooter>
        <Button type="submit" @click="updateValue">
          确认
        </Button>
        <Button variant="destructive" @click="preparedSelectOption = undefined">
          取消
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useLocalStorage } from '@vueuse/core'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()

interface Option {
  label: string
  value: 'sell' | 'rent'
}

const options: Option[] = [ // Default options if not provided
  { label: '二手房', value: 'sell' },
  { label: '租房', value: 'rent' },
]

const notShowDialog = useLocalStorage('mode-switch-dialog-not-show', false)
/**
 * 选择值
 */
const selectOption = useLocalStorage('select-mode', 'sell')
/**
 * 未确认的选择值
 */
const preparedSelectOption = ref<'sell' | 'rent' | undefined>(undefined)


// Define emits using defineEmits
const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()

function tryUpdateValue(newValue: 'sell' | 'rent') {
  if (newValue === selectOption.value) {
    return
  }

  preparedSelectOption.value = newValue

  if (notShowDialog.value) {
    updateValue()
    return
  }
}

// Function to update the value and emit the event
const updateValue = () => {
  if (!preparedSelectOption.value) {
    throw new Error('preparedSelectOption.value is null')
  }
  selectOption.value = preparedSelectOption.value
  emits('update:modelValue', preparedSelectOption.value)
  preparedSelectOption.value = undefined

  updateRoute()
}

async function updateRoute() {
  const curPath = route.path

  //white list
  if (
    !(
      (curPath.includes('/list') || curPath.includes('/change'))
      &&
      (curPath.includes('/c/') || curPath.includes('/h/'))
    )
  ) {
    return
  }

  const sellPrefix = '/'
  const rentPrefix = '/rent/'
  const changedPath = curPath.replace(selectOption.value === 'rent' ? sellPrefix : rentPrefix, selectOption.value === 'rent' ? rentPrefix : sellPrefix)
  console.log(curPath, '--->', changedPath)

  if (checkPathExists(changedPath)) {
    router.push({ path: changedPath })
  } else {
    router.push({ path: '/' })
  }


}

// 检查路径是否存在
const checkPathExists = (path: string) => {
  try {
    const resolvedRoute = router.resolve(path);
    // 如果 resolvedRoute.matched 数组为空，则路径不存在
    return resolvedRoute.matched.length > 0;
  } catch (e) {
    // 如果解析失败，也说明路径不存在
    return false;
  }
};
</script>

<style scoped>
/* Add any component-specific styles here if needed */
/* Using Tailwind CSS classes primarily */
.bg-muted {
  /* Define muted background color if not already defined globally via Tailwind config */
  background-color: #f1f5f9;
  /* Example: light gray */
}

.text-muted-foreground {
  /* Define muted text color */
  color: #64748b;
  /* Example: slate-500 */
}

.bg-background {
  /* Define primary background color for selected item */
  background-color: #ffffff;
  /* Example: white */
}

.text-foreground {
  /* Define primary text color for selected item */
  color: #0f172a;
  /* Example: slate-900 */
}

.ring-ring {
  /* Define focus ring color */
  --tw-ring-color: #94a3b8;
  /* Example: slate-400 */
}

.ring-offset-background {
  /* Define ring offset color */
  --tw-ring-offset-color: #ffffff;
  /* Example: white */
}

/* Consider dark mode if applicable */
/* .dark .bg-muted { background-color: #334155; } */
/* .dark .text-muted-foreground { color: #94a3b8; } */
/* .dark .bg-background { background-color: #1e293b; } */
/* .dark .text-foreground { color: #f8fafc; } */
</style>
