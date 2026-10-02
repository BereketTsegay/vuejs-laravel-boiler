<template>
  <section class="creator-panel" aria-labelledby="creator-title">
    <div class="creator-topline"><span class="creator-icon">+</span><div><p class="eyebrow">SCHEMA BUILDER</p><h3 id="creator-title">Create an access rule</h3></div><span class="private-label"><i></i> ADMIN ONLY</span></div>
    <p class="creator-description">Add a role or permission to your workspace access model.</p>
    <form @submit.prevent="handleSubmit" class="creator-form">
      <div class="form-group"><label for="schema-type">Entry type</label><select id="schema-type" v-model="form.type"><option value="permission">Permission</option><option value="role">Role</option></select></div>
      <div class="form-group"><label for="schema-name">System name</label><input id="schema-name" v-model="form.name" type="text" :placeholder="form.type === 'permission' ? 'view-reports' : 'content-manager'" pattern="[a-z0-9]+(-[a-z0-9]+)*" minlength="3" maxlength="50" autocomplete="off" required /><small>Lowercase letters and numbers, separated by hyphens.</small></div>
      <button type="submit" :disabled="submitting" class="create-button"><span aria-hidden="true">+</span>{{ submitting ? 'Creating…' : `Create ${form.type}` }}</button>
    </form>
    <p v-if="feedback" :class="['feedback', feedback.type]" :role="feedback.type === 'error' ? 'alert' : 'status'">{{ feedback.text }}</p>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue';
import api from '../api/axios';

const emit = defineEmits(['schemaCreated']);
const form = reactive({ type: 'permission', name: '' });
const submitting = ref(false);
const feedback = ref(null);
const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const handleSubmit = async () => {
  feedback.value = null;
  const sanitizedName = form.name.trim().toLowerCase();
  if (sanitizedName.length < 3 || !kebabCaseRegex.test(sanitizedName)) {
    feedback.value = { type: 'error', text: 'Use at least 3 lowercase letters or numbers, with words separated by hyphens.' };
    return;
  }

  submitting.value = true;
  try {
    await api.post('/admin/roles-permissions', { type: form.type, name: sanitizedName });
    feedback.value = { type: 'success', text: `${form.type === 'role' ? 'Role' : 'Permission'} created successfully.` };
    emit('schemaCreated');
    form.name = '';
  } catch (err) {
    feedback.value = { type: 'error', text: err.response?.data?.message || 'Could not create this entry. Check whether the name is already in use.' };
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.creator-panel { margin-bottom: 1.5rem; padding: 1.25rem clamp(1rem, 2vw, 1.5rem) 1.35rem; border: 1px solid #dfe6de; border-radius: 8px; background: linear-gradient(112deg, #f3f7ee 0%, #fff 76%); }
.creator-topline { display: flex; align-items: center; gap: .75rem; }
.creator-icon { display: grid; width: 2.15rem; height: 2.15rem; place-items: center; border-radius: 6px; background: #173d32; color: #d4e86b; font-size: 1.3rem; font-weight: 400; }.eyebrow { margin: 0 0 .2rem; color: #849087; font-size: .61rem; font-weight: 750; letter-spacing: .12em; cursor:pointer }.creator-topline h3 { margin: 0; color: #173d32; font-size: .97rem; font-weight: 650; }.private-label { display: flex; align-items: center; gap: .4rem; margin-left: auto; color: #7c887f; font-size: .58rem; font-weight: 750; letter-spacing: .08em; }.private-label i { width: .38rem; height: .38rem; border-radius: 50%; background: #8aa44b; }.creator-description { margin: .65rem 0 1rem 2.9rem; color: #748078; font-size: .78rem; }
.creator-form { display: grid; grid-template-columns: minmax(150px,.75fr) minmax(220px,1.5fr) auto; align-items: end; gap: .8rem; }.form-group { display: flex; min-width: 0; flex-direction: column; gap: .38rem; }.form-group label { color: #526259; font-size: .7rem; font-weight: 700; }.form-group input, .form-group select { width: 100%; min-width: 0; min-height: 2.65rem; padding: .6rem .75rem; border: 1px solid #d4ddd6; border-radius: 5px; background: white; color: #263c32; font: inherit; font-size: .82rem; }.form-group input:focus, .form-group select:focus { border-color: #176b4b; outline: 3px solid #176b4b20; }.form-group input::placeholder { color: #a0aaa1; }.form-group small { color: #89938b; font-size: .66rem; }.create-button { display: inline-flex; min-height: 2.65rem; align-items: center; justify-content: center; gap: .4rem; padding: .55rem .9rem; border: 1px solid #176b4b; border-radius: 5px; background: #176b4b; color: white; cursor: pointer; font: inherit; font-size: .78rem; font-weight: 650; white-space: nowrap; transition: background .15s ease; }.create-button span { font-size: 1.05rem; font-weight: 400; }.create-button:hover:not(:disabled) { background: #10563b; }.create-button:disabled { cursor: wait; opacity: .6; }.feedback { margin: .85rem 0 0; padding: .65rem .8rem; border: 1px solid; border-radius: 5px; font-size: .76rem; }.success { border-color: #bbddc9; background: #eff8f1; color: #17623f; }.error { border-color: #f0c5bd; background: #fff2ef; color: #a83f2c; }
@media (max-width: 720px) { .creator-form { grid-template-columns: 1fr; }.create-button { justify-self: start; }.creator-description { margin-left: 0; }.private-label { font-size: .52rem; } }
</style>
