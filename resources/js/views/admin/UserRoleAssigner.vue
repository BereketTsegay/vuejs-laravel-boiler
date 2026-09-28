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
import api from '@/services/api';

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
.assigner-card { background: #fff; padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 2rem; }
.search-box input { width: 100%; max-width: 500px; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; margin-bottom: 1rem; }
.user-list { border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
.user-row { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e5e7eb; background: #fafafa; }
.user-row:last-child { border-bottom: none; }
.user-info { display: flex; flex-direction: column; }
.user-info span { font-size: 0.85rem; color: #666; }
.user-roles-chips { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.chip { display: flex; align-items: center; gap: 0.35rem; padding: 0.35rem 0.75rem; background: #fff; border: 1px solid #d1d5db; border-radius: 20px; font-size: 0.85rem; cursor: pointer; }
.no-results { color: #888; font-style: italic; }
</style>
