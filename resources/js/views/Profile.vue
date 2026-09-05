<template>
  <div class="max-w-4xl space-y-8">

    <!-- Feedback Success Alert Toast Pop-box banner -->
    <div v-if="successMessage" class="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center justify-between shadow-sm">
      <span>{{ successMessage }}</span>
      <button @click="successMessage = ''" class="font-bold opacity-50 hover:opacity-100">×</button>
    </div>

    <!-- Section Card Panel Frame 1: Core Metadata Parameters -->
    <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-100">
        <h3 class="text-lg font-bold text-slate-800">Account Profile Details</h3>
        <p class="text-slate-400 text-xs mt-0.5">Manage your personal identification context records.</p>
      </div>

      <form @submit.prevent="handleUpdateInfo" class="p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Identity Name</label>
            <input v-model="infoForm.name" type="text" required
              class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition" />
            <p v-if="errors.info?.name" class="text-red-500 text-xs mt-1">{{ errors.info.name[0] }}</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Communication Email Link</label>
            <input disabled v-model="infoForm.email" type="email" required
              class="w-full  px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition" />
            <p v-if="errors.info?.email" class="text-red-500 text-xs mt-1">{{ errors.info.email[0] }}</p>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button type="submit" :disabled="loadingInfo"
            class="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm transition disabled:opacity-50">
            {{ loadingInfo ? 'Saving Adjustments...' : 'Save Profile Changes' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Section Card Panel Frame 2: Security Parameters -->
    <div class="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      <div class="px-6 py-5 border-b border-slate-100">
        <h3 class="text-lg font-bold text-slate-800">Security Credentials Rotation</h3>
        <p class="text-slate-400 text-xs mt-0.5">Ensure your terminal remains protected against unauthorized breaches.</p>
      </div>

      <form @submit.prevent="handleUpdatePassword" class="p-6 space-y-4">
        <div class="space-y-4 max-w-md">
          <div>
            <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Active Password</label>
            <input v-model="passwordForm.current_password" type="password" required
              class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition" />
            <p v-if="errors.password?.current_password" class="text-red-500 text-xs mt-1">{{ errors.password.current_password[0] }}</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">New Chosen Key</label>
              <input v-model="passwordForm.password" type="password" required
                class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition" />
              <p v-if="errors.password?.password" class="text-red-500 text-xs mt-1">{{ errors.password.password[0] }}</p>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Confirm Target Key</label>
              <input v-model="passwordForm.password_confirmation" type="password" required
                class="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 sm:text-sm transition" />
            </div>
          </div>
        </div>

        <div class="flex justify-end pt-2">
          <button type="submit" :disabled="loadingPassword"
            class="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-sm transition disabled:opacity-50">
            {{ loadingPassword ? 'Updating Vault...' : 'Rotate Password Credentials' }}
          </button>
        </div>
      </form>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const successMessage = ref('');
const errors = reactive({ info: null, password: null });

const loadingInfo = ref(false);
const loadingPassword = ref(false);

const infoForm = reactive({
  name: authStore.user?.name || '',
  email: authStore.user?.email || ''
});

const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: ''
});

const handleUpdateInfo = async () => {
  loadingInfo.value = false;
  errors.info = null;
  successMessage.value = '';

  try {
    const response = await api.put('/profile/info', infoForm);
    authStore.user = response.data.user; // Synchronize Pinia user runtime data state
    successMessage.value = response.data.message;
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.info = error.response.data.errors;
    }
  } finally {
    loadingInfo.value = false;
  }
};

const handleUpdatePassword = async () => {
  loadingPassword.value = false;
  errors.password = null;
  successMessage.value = '';

  try {
    const response = await api.put('/profile/password', passwordForm);
    successMessage.value = response.data.message;

    // Wipe fields dry upon completion
    passwordForm.current_password = '';
    passwordForm.password = '';
    passwordForm.password_confirmation = '';
  } catch (error) {
    if (error.response && error.response.status === 422) {
      errors.password = error.response.data.errors;
    }
  } finally {
    loadingPassword.value = false;
  }
};
</script>
