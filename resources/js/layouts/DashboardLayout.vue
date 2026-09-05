<template>
  <div class="min-h-screen bg-[#f3f6f1] text-slate-900">
    <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden" @click="mobileMenuOpen = false"></div>

    <aside :class="[
      mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#173d32] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0'
    ]">
      <div class="flex items-center justify-between border-b border-white/10 px-7 py-6">
        <router-link to="/dashboard" class="flex items-center gap-3" @click="mobileMenuOpen = false">
          <span class="grid h-10 w-10 place-items-center rounded-xl bg-[#d4e86b] text-lg font-bold text-[#173d32]">B</span>
          <span class="text-lg font-semibold tracking-tight">Bereket</span>
        </router-link>
        <button class="grid h-9 w-9 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close navigation" @click="mobileMenuOpen = false">&times;</button>
      </div>

      <div class="px-7 pb-5 pt-8"><p class="text-[10px] font-semibold tracking-[0.2em] text-white/40 uppercase">Workspace</p></div>

      <nav class="flex-1 space-y-1 px-4">
        <router-link v-for="item in navItems" :key="item.path" :to="item.path" class="block" @click="mobileMenuOpen = false">
          <div :class="[
            isActive(item.path) ? 'bg-[#d4e86b] font-semibold text-[#173d32] shadow-lg shadow-black/10' : 'text-white/65 hover:bg-white/10 hover:text-white',
            'flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition'
          ]">
            <span :class="[isActive(item.path) ? 'bg-[#173d32]/10' : 'bg-white/10', 'grid h-8 w-8 place-items-center rounded-lg text-[10px] font-bold tracking-wide']">{{ item.short }}</span>
            <span>{{ item.name }}</span>
          </div>
        </router-link>
      </nav>

      <div class="m-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="flex items-center gap-3">
          <div class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#d4e86b] font-semibold text-[#173d32]">{{ userInitial }}</div>
          <div class="min-w-0"><p class="truncate text-sm font-semibold">{{ authStore.user?.name || 'Workspace member' }}</p><p class="mt-0.5 truncate text-[10px] font-semibold tracking-[0.15em] text-white/45 uppercase">{{ authStore.roleName }}</p></div>
        </div>
        <button class="mt-4 flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/10 hover:text-white" @click="handleLogout"><span>Sign out</span><span aria-hidden="true">&rarr;</span></button>
      </div>
    </aside>

    <div class="min-h-screen lg:pl-72">
      <header class="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-[#f3f6f1]/90 px-5 backdrop-blur-md sm:px-8 lg:px-10">
        <div class="flex items-center gap-4">
          <button class="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm lg:hidden" aria-label="Open navigation" @click="mobileMenuOpen = true">&#9776;</button>
          <div><p class="hidden text-[10px] font-semibold tracking-[0.18em] text-slate-400 uppercase sm:block">Bereket workspace</p><h1 class="text-lg font-semibold tracking-tight text-slate-950">{{ pageTitle }}</h1></div>
        </div>
        <div class="flex items-center gap-3">
          <span class="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:flex"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>All systems normal</span>
          <router-link to="/profile" class="grid h-10 w-10 place-items-center rounded-full bg-[#173d32] text-sm font-semibold text-[#d4e86b]" :aria-label="`Open profile for ${authStore.user?.name || 'user'}`">{{ userInitial }}</router-link>
        </div>
      </header>

      <main class="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10"><router-view /></main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const mobileMenuOpen = ref(false);

const navItems = computed(() => {
  const items = [
    { name: 'Overview', path: '/dashboard', short: 'OV' },
    { name: 'Profile settings', path: '/profile', short: 'PR' }
  ];
  if (authStore.isAdmin) items.push({ name: 'Admin center', path: '/admin', short: 'AD' });
  return items;
});

const pageTitle = computed(() => {
  if (route.name === 'AdminDashboard') return 'Admin center';
  if (route.name === 'Profile') return 'Profile settings';
  return 'Overview';
});

const userInitial = computed(() => authStore.user?.name?.charAt(0)?.toUpperCase() || 'B');
const isActive = (path) => route.path === path;

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: 'Login' });
};
</script>
