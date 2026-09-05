<template>
  <div class="space-y-8">
    <section class="relative overflow-hidden rounded-4xl bg-[#173d32] px-6 py-8 text-white shadow-xl shadow-emerald-950/10 sm:px-10 sm:py-10">
      <div class="absolute -right-16 -top-24 h-72 w-72 rounded-full border-36 border-[#d4e86b]/15"></div>
      <div class="absolute -bottom-28 right-24 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl"></div>
      <div class="relative max-w-2xl">
        <p class="text-sm font-semibold tracking-[0.18em] text-[#d4e86b] uppercase">Your workspace</p>
        <h2 class="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Good morning, {{ firstName }}.</h2>
        <p class="mt-4 max-w-xl text-sm leading-7 text-white/65">Everything is in place. Keep your momentum clear, focused, and moving forward.</p>
        <router-link to="/profile" class="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#d4e86b] px-4 py-3 text-sm font-semibold text-[#173d32] transition hover:bg-[#e0f38c]">Review your profile <span aria-hidden="true">&rarr;</span></router-link>
      </div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between"><p class="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">Account status</p><span class="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">OK</span></div>
        <p class="mt-7 text-2xl font-semibold tracking-tight text-slate-950">Active</p>
        <p class="mt-1 text-sm text-slate-500">Your workspace is ready.</p>
      </article>
      <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div class="flex items-start justify-between"><p class="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">Access level</p><span class="grid h-9 w-9 place-items-center rounded-xl bg-lime-50 text-lime-700">{{ roleShort }}</span></div>
        <p class="mt-7 text-2xl font-semibold tracking-tight text-slate-950 capitalize">{{ authStore.roleName }}</p>
        <p class="mt-1 text-sm text-slate-500">Permissions are up to date.</p>
      </article>
      <article class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
        <div class="flex items-start justify-between"><p class="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">Platform</p><span class="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-xs font-bold text-slate-600">V3</span></div>
        <p class="mt-7 text-2xl font-semibold tracking-tight text-slate-950">Connected</p>
        <p class="mt-1 text-sm text-slate-500">Laravel and Vue are in sync.</p>
      </article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <div class="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5 sm:px-7">
          <div><h3 class="text-base font-semibold text-slate-950">Recent activity</h3><p class="mt-1 text-sm text-slate-500">A quick view of your workspace health.</p></div>
          <span class="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase">Live</span>
        </div>
        <div class="divide-y divide-slate-100">
          <div v-for="item in activity" :key="item.title" class="flex items-center gap-4 px-6 py-5 sm:px-7">
            <span :class="[item.iconClass, 'grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xs font-bold']">{{ item.icon }}</span>
            <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-slate-800">{{ item.title }}</p><p class="mt-1 text-xs text-slate-400">{{ item.detail }}</p></div>
            <span class="text-xs text-slate-400">{{ item.time }}</span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl bg-[#e8efdf] p-6 sm:p-7">
        <span class="grid h-10 w-10 place-items-center rounded-xl bg-white text-sm font-bold text-[#173d32]">01</span>
        <h3 class="mt-8 text-xl font-semibold tracking-tight text-[#173d32]">Keep your details current.</h3>
        <p class="mt-3 text-sm leading-6 text-[#173d32]/65">A complete profile helps your workspace stay useful and personal.</p>
        <router-link to="/profile" class="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#173d32] hover:text-emerald-700">Open profile <span aria-hidden="true">&rarr;</span></router-link>
      </div>
    </section>
  </div>
 </template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const firstName = computed(() => authStore.user?.name?.split(' ')[0] || 'there');
const roleShort = computed(() => (authStore.user?.role || 'user').slice(0, 2).toUpperCase());
const activity = [
  { title: 'Account session verified', detail: 'Your current session is protected and active.', time: 'Now', icon: 'OK', iconClass: 'bg-emerald-50 text-emerald-700' },
  { title: 'Workspace connected', detail: 'Your dashboard is connected to the application API.', time: 'Today', icon: 'IN', iconClass: 'bg-lime-50 text-lime-700' },
  { title: 'Profile ready to review', detail: 'Keep your personal information up to date.', time: 'Next', icon: 'PR', iconClass: 'bg-slate-100 text-slate-600' }
];
</script>
