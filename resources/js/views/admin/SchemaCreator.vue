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
import api from '../../api/axios';

const emit = defineEmits(['schemaCreated']);

const form = reactive({ type: 'permission', name: '' });
const submitting = ref(false);
const feedback = ref(null);

const handleSubmit = async () => {
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
.creator-card { background: #fff; padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 2rem; }
.creator-form { display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
input, select { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; min-width: 220px; }
.btn-primary { padding: 0.6rem 1.2rem; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btn-primary:disabled { opacity: 0.6; }
.feedback { margin-top: 1rem; font-size: 0.9rem; font-weight: 500; }
.success { color: #16a34a; }
.error { color: #dc2626; }
</style>
