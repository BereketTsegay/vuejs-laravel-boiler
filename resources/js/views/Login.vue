<template>
  <div class="min-h-screen bg-[#f4f7f2] px-4 py-6 text-slate-900 sm:px-8 lg:px-12">
    <div class="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_80px_rgba(30,52,40,0.12)] lg:grid-cols-[0.85fr_1.15fr]">
      <aside class="relative hidden overflow-hidden bg-[#173d32] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div class="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[40px] border-[#d4e86b]/20"></div>
        <div class="relative">
          <div class="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] uppercase">
            <span class="grid h-9 w-9 place-items-center rounded-xl bg-[#d4e86b] text-[#173d32]">B</span>
            Bereket
          </div>
          <div class="mt-24 max-w-sm">
            <p class="text-sm font-semibold tracking-[0.2em] text-[#d4e86b] uppercase">Welcome back</p>
            <h1 class="mt-5 text-5xl font-semibold leading-[1.05] tracking-tight">Make space for good work.</h1>
            <p class="mt-6 text-base leading-7 text-white/65">Your calm, capable workspace is ready when you are.</p>
          </div>
        </div>
        <p class="relative text-xs text-white/45">A better way to begin the day.</p>
      </aside>

      <main class="flex items-center px-6 py-10 sm:px-12 lg:px-20">
        <div class="mx-auto w-full max-w-md">
          <div class="mb-10 lg:hidden">
            <div class="flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-[#173d32] uppercase">
              <span class="grid h-9 w-9 place-items-center rounded-xl bg-[#d4e86b]">B</span>
              Bereket
            </div>
          </div>
          <div>
            <p class="text-sm font-semibold tracking-[0.18em] text-emerald-700 uppercase">Sign in</p>
            <h2 class="mt-3 text-4xl font-semibold tracking-tight text-slate-950">Good to see you.</h2>
            <p class="mt-3 text-sm leading-6 text-slate-500">Enter your details to continue to your workspace.</p>
          </div>

          <div v-if="errorMessage" class="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {{ errorMessage }}
          </div>

          <form class="mt-8 space-y-5" @submit.prevent="handleLogin">
            <div>
              <label for="email-address" class="block text-sm font-medium text-slate-700">Email address</label>
              <input v-model="form.email" id="email-address" name="email" type="email" autocomplete="email" required
                class="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10" />
            </div>
            <div>
              <div class="flex items-center justify-between">
                <label for="password" class="block text-sm font-medium text-slate-700">Password</label>
                <span class="text-xs text-slate-400">Keep it secure</span>
              </div>
              <input v-model="form.password" id="password" name="password" type="password" autocomplete="current-password" required
                class="mt-2 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10" />
            </div>
            <button type="submit" :disabled="authStore.loading"
              class="flex w-full items-center justify-center rounded-xl bg-[#173d32] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#173d32]/15 transition hover:bg-[#225746] focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-50">
              <span v-if="authStore.loading">Signing in...</span>
              <span v-else>Continue to workspace <span aria-hidden="true">&rarr;</span></span>
            </button>
          </form>

          <p class="mt-8 text-center text-sm text-slate-500">
            New to Bereket?
            <router-link to="/register" class="font-semibold text-emerald-700 transition hover:text-emerald-900">Create an account</router-link>
          </p>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const form = reactive({
  email: '',
  password: ''
});

const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';
  try {
    const success = await authStore.login(form);
    if (success) {
      router.push({ name: 'Dashboard' });
    }
  } catch (error) {
    errorMessage.value = error.message || 'Invalid email or password combination.';
  }
};
</script>
