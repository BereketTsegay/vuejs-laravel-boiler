<!-- src/components/admin/UserRoleAssigner.vue -->
<template>
  <div class="assigner-card">
    <h3>User Role Assignments</h3>
    <div class="search-box">
      <input 
        v-model="searchQuery" 
        @input="debounceSearch" 
        type="text" 
        placeholder="Search user by name or email address..." 
      />
    </div>

    <!-- Search Results Dropdown/List -->
    <div v-if="users.length > 0" class="user-list">
      <div v-for="user in users" :key="user.id" class="user-row">
        <div class="user-info">
          <strong>{{ user.name }}</strong>
          <span>{{ user.email }}</span>
        </div>
        
        <!-- Role Checkboxes for this explicit user -->
        <div class="user-roles-chips">
          <label v-for="role in availableRoles" :key="role.id" class="chip">
            <input 
              type="checkbox" 
              :checked="user.roles.includes(role.name)"
              @change="toggleUserRole(user, role.name)" 
            />
            {{ role.name }}
          </label>
        </div>
      </div>
    </div>
    <p v-else-if="searchQuery.length > 1" class="no-results">No matching system users found.</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api/axios';

defineProps({
  availableRoles: { type: Array, required: true }
});

const searchQuery = ref('');
const users = ref([]);
let timeoutId = null;

const debounceSearch = () => {
  clearTimeout(timeoutId);
  if (searchQuery.value.length < 2) {
    users.value = [];
    return;
  }
  timeoutId = setTimeout(async () => {
    try {
      const response = await api.get('/admin/users/search', { params: { q: searchQuery.value } });
      users.value = response.data;
    } catch (err) {
      console.error(err);
    }
  }, 300); // 300ms network debounce delay
};

const toggleUserRole = async (user, roleName) => {
  let updatedRoles = [...user.roles];
  if (updatedRoles.includes(roleName)) {
    updatedRoles = updatedRoles.filter(r => r !== roleName);
  } else {
    updatedRoles.push(roleName);
  }

  try {
    await api.put(`/admin/users/${user.id}/roles`, { roles: updatedRoles });
    user.roles = updatedRoles; // Locally reflect state change smoothly
  } catch (err) {
    alert('Failed to update user authorization tiers.');
  }
};
</script>

<style scoped>
.assigner-card { margin-bottom: 2rem; padding: clamp(1.1rem, 2.5vw, 1.6rem); border: 1px solid #e1e7e2; border-radius: 8px; background: #fff; color: #202b27; }
.assigner-card h3 { margin: 0 0 1.1rem; font-size: 1.05rem; font-weight: 650; }
.search-box { margin-bottom: 1rem; }
.search-box input {
  width: 100%;
  max-width: 560px;
  min-height: 2.8rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid #d4ddd6;
  border-radius: 5px;
  background: #fbfcfb;
  color: #202b27;
  font: inherit;
  font-size: 0.875rem;
  transition: border-color 150ms ease, box-shadow 150ms ease, background-color 150ms ease;
}
.search-box input:focus { border-color: #176b4b; outline: 0; background: #fff; box-shadow: 0 0 0 3px rgb(23 107 75 / 12%); }
.search-box input::placeholder { color: #89938d; }
.user-list { overflow: hidden; border: 1px solid #e1e7e2; border-radius: 6px; }
.user-row { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; padding: 1rem; border-bottom: 1px solid #e8ede9; background: #fff; transition: background-color 150ms ease; }
.user-row:hover { background: #f7faf7; }
.user-row:last-child { border-bottom: 0; }
.user-info { display: flex; min-width: 180px; flex-direction: column; gap: 0.2rem; }
.user-info strong { font-size: 0.9rem; font-weight: 650; }
.user-info span { color: #68736d; font-size: 0.8rem; overflow-wrap: anywhere; }
.user-roles-chips { display: flex; justify-content: flex-end; gap: 0.5rem; flex-wrap: wrap; }
.chip { display: inline-flex; align-items: center; gap: 0.4rem; min-height: 2rem; padding: 0.35rem 0.65rem; border: 1px solid #dbe3dc; border-radius: 5px; background: #f7f9f7; color: #58655e; cursor: pointer; font-size: 0.78rem; font-weight: 550; transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease; }
.chip:has(input:checked) { border-color: #acd0b9; background: #eaf5ed; color: #17623f; }
.chip input { width: 0.95rem; height: 0.95rem; margin: 0; accent-color: #176b4b; cursor: pointer; }
.chip:focus-within { outline: 3px solid rgb(23 107 75 / 18%); outline-offset: 2px; }
.no-results { margin: 0; padding: 1rem; border: 1px dashed #d4ddd6; border-radius: 6px; background: #f7f9f7; color: #68736d; font-size: 0.875rem; }
@media (max-width: 680px) { .user-row { align-items: flex-start; flex-direction: column; gap: 0.85rem; } .user-roles-chips { justify-content: flex-start; } }
</style>
