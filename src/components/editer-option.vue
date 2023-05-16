<template>
	<div style="display: flex;align-items: center">
      <slot>
	      <span style="width: 60px; text-align: right;margin-right: 10px">{{ label }}</span>
	      <a-slider :value="value" :min="min" :max="max"
	                :key="key" @change="$emit('update:value',$event)" :step="step" :disabled="disabled"/>
	      <a-input-number :value="value" :min="min" :max="max" :step="step"
	                      :precision="precision"
	                      style="margin-left: 16px" @change="$emit('update:value',$event)" :disabled="disabled"/>
      </slot>
	</div>
</template>

<script setup>
import {defineProps, toRefs} from 'vue'

const props = defineProps(['value', 'min', 'max', 'key', 'step', 'precision', 'label','disabled'])
const {value, min, max, key, step, precision, label,disabled} = toRefs(props)
</script>

<style scoped>
:deep(.ant-slider) {
    width: 300px;
}
</style>
