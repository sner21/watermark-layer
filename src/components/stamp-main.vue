<template>
	    <stamp-canvas :canvas="props.canvas" :size="size">
       <slot></slot>
      </stamp-canvas>
</template>

<script setup>
import {defineProps} from 'vue';
import StampCanvas from '@/components/stamp-canvas.vue'
const props=defineProps(['canvas','size'])
</script>

