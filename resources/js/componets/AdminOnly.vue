<template>
  <slot v-if="authStore.isAdmin" />
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
const authStore = useAuthStore();
</script>
