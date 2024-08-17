<template>
  <a-config-provider :theme="{
      token: {
        colorPrimary: '#425a75',
      },
    }">
    <MarkMain></MarkMain>
  </a-config-provider>
</template>
<script setup>
import MarkMain from "./src/views/MarkMain.vue";
</script>
