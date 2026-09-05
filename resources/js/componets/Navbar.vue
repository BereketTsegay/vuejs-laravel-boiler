<template>
  <nav class="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
    <div class="font-bold text-lg text-emerald-700">SPA Portal</div>

    <div class="flex items-center gap-4">
      <template v-if="authStore.isAuthenticated">
        <span class="text-sm text-gray-600">Hello, {{ authStore.user?.name }}</span>
        <button @click="handleLogout" class="text-sm font-medium text-gray-500 hover:text-gray-900">
          Sign Out
        </button>
      </template>
      <template v-else>
        <router-link to="/login" class="text-sm font-medium text-emerald-600 hover:text-emerald-700">Sign In</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: 'Login' });
};
</script>
