
<script setup lang="ts">
import type {HTMLAttributes} from 'vue'
import SelectButton from "@/components/custom/SelectButton.vue";

/**
 * 基于SelectButton, 创建一个SwitchButton, v-model为单个boolean值
 */


interface Props {
  class?: HTMLAttributes['class']
}


const props = withDefaults(defineProps<Props>(), {
  class: '',
  canCancel:false,
})

const model = defineModel<boolean | null>()

const BooleanButton=SelectButton<boolean>
</script>

<template>
  <BooleanButton :value="true" v-model="model" canCancel  :class="props.class">
    <slot/>
  </BooleanButton>
</template>