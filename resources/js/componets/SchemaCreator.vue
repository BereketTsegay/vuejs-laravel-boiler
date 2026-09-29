<!-- src/components/admin/SchemaCreator.vue -->
<template>
  <div class="creator-card">
    <h3>Create New Role or Permission</h3>
    <form @submit.prevent="handleSubmit" class="creator-form">
      <div class="form-group">
        <label>Type</label>
        <select v-model="form.type">
          <option value="role">Role (e.g., manager, moderator)</option>
          <option value="permission">Permission (e.g., view-reports, edit-billing)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Systemic Name</label>
        <input 
          v-model="form.name" 
          type="text" 
          placeholder="use-hyphens-for-permissions" 
          required 
        />
      </div>

      <button type="submit" :disabled="submitting" class="btn-primary">
        {{ submitting ? 'Saving...' : 'Register Entry' }}
      </button>
    </form>
    <p v-if="feedback" :class="['feedback', feedback.type]">{{ feedback.text }}</p>
  </div>
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

  console.log('Submitting form:', form);

  feedback.value = null;
  
  // Format string properties locally ahead of verification checks
  const sanitizedName = form.name.trim().toLowerCase();

  // Guard Clause: Local validation check
  if (!kebabCaseRegex.test(sanitizedName)) {
    feedback.value = { 
      type: 'error', 
      text: 'Frontend Notice: Please format name structures using lower kebab-case layout rules (e.g., system-audit-view).' 
    };
    return;
  }

  submitting.value = true;
  try {
    await api.post('/admin/roles-permissions', {
      type: form.type,
      name: sanitizedName
    });
    
    feedback.value = { type: 'success', text: `${form.type} configuration written directly to master logs.` };
    emit('schemaCreated'); 
    form.name = '';
  } catch (err) {
    feedback.value = { 
      type: 'error', 
      text: err.response?.data?.message || 'Database rejected entity parameters.' 
    };
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.creator-card {
  margin-bottom: 1.5rem;
  padding: clamp(1.1rem, 2.5vw, 1.6rem);
  border: 1px solid #e1e7e2;
  border-radius: 8px;
  background: linear-gradient(115deg, #f3f7f3 0%, #fff 65%);
}
.creator-card h3 { margin: 0 0 1.2rem; color: #202b27; font-size: 1.05rem; font-weight: 650; }
.creator-form { display: grid; grid-template-columns: minmax(180px, 0.8fr) minmax(220px, 1.4fr) auto; gap: 1rem; align-items: end; }
.form-group { display: flex; min-width: 0; flex-direction: column; gap: 0.45rem; }
.form-group label { color: #58655e; font-size: 0.75rem; font-weight: 700; }
.creator-form input, .creator-form select {
  width: 100%;
  min-width: 0;
  min-height: 2.75rem;
  padding: 0.65rem 0.8rem;
  border: 1px solid #d4ddd6;
  border-radius: 5px;
  background: #fff;
  color: #202b27;
  font: inherit;
  font-size: 0.875rem;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.creator-form input:focus, .creator-form select:focus { border-color: #176b4b; outline: 0; box-shadow: 0 0 0 3px rgb(23 107 75 / 12%); }
.btn-primary {
  min-height: 2.75rem;
  padding: 0.65rem 1rem;
  border: 1px solid #176b4b;
  border-radius: 5px;
  background: #176b4b;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 650;
  transition: background-color 150ms ease, transform 150ms ease;
}
.btn-primary:hover:not(:disabled) { background: #10563b; }
.btn-primary:active:not(:disabled) { transform: translateY(1px); }
.btn-primary:disabled { opacity: 0.6; cursor: wait; }
.feedback { margin: 1rem 0 0; padding: 0.75rem 0.9rem; border: 1px solid; border-radius: 5px; font-size: 0.85rem; font-weight: 550; }
.success { border-color: #bbddc9; background: #eff8f1; color: #17623f; }
.error { border-color: #f0c5bd; background: #fff2ef; color: #a83f2c; }
@media (max-width: 720px) { .creator-form { grid-template-columns: 1fr; } .btn-primary { justify-self: start; } }
</style>
