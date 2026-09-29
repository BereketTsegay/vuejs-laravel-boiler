<template>
  <div class="space-y-8">
    <section class="flex flex-col justify-between gap-6 rounded-4xl border border-slate-200/80 bg-white px-6 py-7 shadow-sm sm:px-8 sm:py-9 md:flex-row md:items-end">
      <div><div class="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-emerald-700 uppercase"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>Restricted area</div><h2 class="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Admin center</h2><p class="mt-3 max-w-xl text-sm leading-6 text-slate-500">A focused view of your platform, people, and system health.</p></div>
      <div class="rounded-xl bg-[#173d32] px-4 py-3 text-right text-white"><p class="text-[10px] font-semibold tracking-[0.15em] text-[#d4e86b] uppercase">Access</p><p class="mt-1 text-sm font-medium">Administrator</p></div>
    </section>

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <article class="rounded-2xl bg-[#173d32] p-6 text-white shadow-lg shadow-emerald-950/10"><div class="flex items-center justify-between"><p class="text-xs font-semibold tracking-[0.16em] text-white/50 uppercase">Users</p><span class="text-xs text-[#d4e86b]">LIVE</span></div><p class="mt-8 text-4xl font-semibold tracking-tight">{{ adminStats.totalUsers }}</p><p class="mt-2 text-sm text-white/55">Registered accounts</p></article>
      <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"><div class="flex items-center justify-between"><p class="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">System status</p><span class="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700">OK</span></div><p class="mt-8 text-2xl font-semibold tracking-tight text-slate-950">{{ adminStats.systemStatus }}</p><p class="mt-2 text-sm text-slate-500">Core services operational</p></article>
      <article class="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:col-span-2 xl:col-span-1"><div class="flex items-center justify-between"><p class="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">Environment</p><span class="grid h-9 w-9 place-items-center rounded-xl bg-lime-50 text-xs font-bold text-lime-700">ENV</span></div><p class="mt-8 text-2xl font-semibold tracking-tight text-slate-950 capitalize">{{ adminStats.environment }}</p><p class="mt-2 text-sm text-slate-500">Current application context</p></article>
    </section>

    <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div class="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div class="border-b border-slate-100 px-6 py-5 sm:px-7"><h3 class="text-base font-semibold text-slate-950">Administration tools</h3><p class="mt-1 text-sm text-slate-500">The controls available to your administrator role.</p></div>
        <div class="grid gap-3 p-5 sm:grid-cols-2 sm:p-7">
          <div v-for="tool in tools" :key="tool.title" class="group rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40"><div class="flex items-center justify-between"><span class="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700">{{ tool.short }}</span><span class="text-slate-300 transition group-hover:text-emerald-600" aria-hidden="true">&rarr;</span></div><h4 class="mt-5 text-sm font-semibold text-slate-800">{{ tool.title }}</h4><p class="mt-1 text-xs leading-5 text-slate-500">{{ tool.detail }}</p></div>
        </div>
      </div>

      <div class="rounded-2xl bg-[#e8efdf] p-6 sm:p-7"><span class="grid h-10 w-10 place-items-center rounded-xl bg-white text-xs font-bold text-[#173d32]">SYS</span><h3 class="mt-8 text-xl font-semibold tracking-tight text-[#173d32]">Platform health is steady.</h3><p class="mt-3 text-sm leading-6 text-[#173d32]/65">No active incidents or pending system actions require your attention.</p><div class="mt-8 flex items-center gap-3 border-t border-[#173d32]/10 pt-5"><span class="h-2 w-2 rounded-full bg-emerald-600"></span><span class="text-xs font-semibold text-[#173d32]">All services operational</span></div></div>
    </section>
  </div>
 </template>

<script setup>
import { onMounted, reactive } from 'vue';
import api from '../../api/axios';

const adminStats = reactive({ totalUsers: '--', systemStatus: 'Operational', environment: 'Unknown' });
const tools = [
  { short: 'USR', title: 'User management', detail: 'Review account access and role assignments.' },
  { short: 'LOG', title: 'Activity logs', detail: 'Inspect recent platform events and audits.' },
  { short: 'CFG', title: 'System settings', detail: 'Keep application configuration in check.' },
  { short: 'SEC', title: 'Security review', detail: 'Monitor access and authentication signals.' }
];

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/dashboard');
    adminStats.totalUsers = data.metrics.total_users ?? '--';
    adminStats.systemStatus = data.metrics.system_status || 'Operational';
    adminStats.environment = data.metrics.environment || 'Unknown';
  } catch {}
});
</script>
