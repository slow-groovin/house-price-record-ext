<template>
  <Dialog v-if="isOpen" :default-open="isOpen">
    <DialogTrigger as-child>
      <slot name="trigger" />
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>更新至 {{ version }}</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <pre>{{ curVersionChangeLog }}</pre>
      <DialogFooter class="sm:justify-start">
        <DialogClose as-child>
          <Button type="button" variant="default" @click="$emit('confirm')">
            确认
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, storage } from '#imports';
import {
  Dialog,
  DialogClose,
  DialogContent, DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExtInfo } from '@/composables/useExtInfo';
const { curVersionChangeLog, version } = useExtInfo()
const isOpen = ref(false)
onMounted(async () => {
  const lastVersion = await storage.getItem('local:last-version-flag')
  if (lastVersion !== version) {
    console.log("hint update.")
    isOpen.value = true
  }

  await storage.setItem('local:last-version-flag', version)
})
</script>