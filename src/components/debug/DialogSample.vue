<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,

  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ConfirmDialog from "@/components/custom/ConfirmDialog.vue";


function confirmDelete(){
  alert('确认删除!')
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline">
        Dialog First Sample
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Share link</DialogTitle>
        <DialogDescription>
          Anyone who has this link will be able to view this.
        </DialogDescription>
      </DialogHeader>
      <div class="flex items-center space-x-2">
        <div class="grid flex-1 gap-2">
          <Label for="link" class="sr-only">
            Link
          </Label>
          <Input
            id="link"
            default-value="https://shadcn-vue.com/docs/installation"
            read-only
          />
        </div>
        <Button type="submit" size="sm" class="px-3">
          <span class="sr-only">Copy</span>
        </Button>
      </div>
      <DialogFooter class="sm:justify-start">
        <DialogClose as-child>
          <Button type="button" variant="secondary">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  </Dialog>


  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline">
        Confirm Dialog
      </Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>确认</DialogTitle>

      </DialogHeader>
      <div>
        确认要xxx吗
      </div>
      <DialogFooter class="sm:justify-start">
        <DialogClose as-child>
          <Button type="button" variant="default">
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

  <ConfirmDialog @confirm="confirmDelete">
    <template #trigger>
      <Button>
        复用确认弹窗
      </Button>
    </template>
    <template #default>
      确认要删除吗
    </template>
  </ConfirmDialog>
</template>

<style scoped>

</style>