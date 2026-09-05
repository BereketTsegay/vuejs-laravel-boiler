<template>
  <div class="min-h-screen bg-[#f4f7f2] px-4 py-6 text-slate-900 sm:px-8 lg:px-12">
    <div class="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-4xl bg-white shadow-[0_24px_80px_rgba(30,52,40,0.12)] lg:grid-cols-[0.85fr_1.15fr]">
      <aside class="relative hidden overflow-hidden bg-[#173d32] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div class="absolute -right-24 -top-24 h-72 w-72 rounded-full border-40 border-[#d4e86b]/20"></div>
        <div class="relative">
          <div class="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] uppercase"><span class="grid h-9 w-9 place-items-center rounded-xl bg-[#d4e86b] text-[#173d32]">B</span> Bereket</div>
          <div class="mt-24 max-w-sm"><p class="text-sm font-semibold tracking-[0.2em] text-[#d4e86b] uppercase">Start fresh</p><h1 class="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight">Build your best rhythm.</h1><p class="mt-6 text-base leading-7 text-white/65">A thoughtful home for the work that matters to you.</p></div>
        </div>
        <p class="relative text-xs text-white/45">Small steps. Clearer days.</p>
      </aside>

      <main class="flex items-center px-6 py-10 sm:px-12 lg:px-20">
        <div class="mx-auto w-full max-w-md">
          <div class="mb-10 lg:hidden"><div class="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[#173d32] uppercase"><span class="grid h-9 w-9 place-items-center rounded-xl bg-[#d4e86b]">B</span> Bereket</div></div>
          <div><p class="text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase">Create account</p><h2 class="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Let’s get started.</h2><p class="mt-3 text-sm leading-6 text-slate-500">Set up your account and make your workspace yours.</p></div>

          <div v-if="errors.global" class="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{{ errors.global }}</div>

          <form class="mt-8 space-y-4" @submit.prevent="handleRegister">
            <div><label for="name" class="block text-sm font-medium text-slate-700">Full name</label><input v-model="form.name" id="name" type="text" autocomplete="name" required class="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10" /><p v-if="errors.name" class="mt-1.5 text-xs text-red-600">{{ errors.name[0] }}</p></div>
            <div><label for="register-email" class="block text-sm font-medium text-slate-700">Email address</label><input v-model="form.email" id="register-email" type="email" autocomplete="email" required class="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10" /><p v-if="errors.email" class="mt-1.5 text-xs text-red-600">{{ errors.email[0] }}</p></div>
            <div class="grid gap-4 sm:grid-cols-2"><div><label for="register-password" class="block text-sm font-medium text-slate-700">Password</label><input v-model="form.password" id="register-password" type="password" autocomplete="new-password" required class="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10" /><p v-if="errors.password" class="mt-1.5 text-xs text-red-600">{{ errors.password[0] }}</p></div><div><label for="password-confirmation" class="block text-sm font-medium text-slate-700">Confirm password</label><input v-model="form.password_confirmation" id="password-confirmation" type="password" autocomplete="new-password" required class="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10" /></div></div>
            <button type="submit" :disabled="loading" class="mt-3 flex w-full items-center justify-center rounded-xl bg-[#173d32] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#173d32]/15 transition hover:bg-[#225746] focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50">{{ loading ? 'Creating your account...' : 'Create account' }} <span v-if="!loading" class="ml-2" aria-hidden="true">&rarr;</span></button>
          </form>

          <p class="mt-8 text-center text-sm text-slate-500">Already have an account? <router-link to="/login" class="font-semibold text-emerald-700 transition hover:text-emerald-900">Sign in</router-link></p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
});

const loading = ref(false);
const errors = ref({});

const handleRegister = async () => {
  loading.value = true;
  errors.value = {};

  try {
    console.log(api.defaults.headers.common["Authorization"]); // Debugging line to check the Authorization header
    await authStore.register(form); // Use the Pinia store action for registration
    router.push({ name: 'Dashboard' });
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.value = error.response.data.errors;
    } else {
        console.error('Unexpected error during registration:', error);
      errors.value.global = 'An unexpected setup error occurred.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
