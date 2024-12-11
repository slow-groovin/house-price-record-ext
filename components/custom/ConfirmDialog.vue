<script setup lang="ts">

import {
  Dialog,
  DialogClose,
  DialogContent, DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

defineEmits(['confirm'])
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <slot name="trigger"/>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>确认</DialogTitle>
        <DialogDescription></DialogDescription>
      </DialogHeader>
      <slot/>
      <DialogFooter class="sm:justify-start">
        <DialogClose as-child>
          <Button type="button" variant="default" @click="$emit('confirm')">
            确认
          </Button>
        </DialogClose>
        <DialogClose as-child>
          <Button type="button" variant="destructive">
            取消
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<style scoped>

</style>