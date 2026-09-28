<!-- src/views/admin/RoleManager.vue -->
<template>
  <div class="role-manager-container">
    <h2>System Role & Permission Matrix</h2>
    <p class="subtitle">Modify role scopes dynamically. Changes propagate to users upon token refresh.</p>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">Fetching matrix states...</div>

    <!-- Error State -->
    <div v-if="error" class="error-banner">{{ error }}</div>

    <!-- Management Matrix Table -->
    <div v-if="!loading && !error" class="table-wrapper">
      <table class="matrix-table">
        <thead>
          <tr>
            <th>Permissions / Capabilities</th>
            <!-- Dynamically listing every Role as columns -->
            <th v-for="role in roles" :key="role.id" class="text-center">
              {{ role.name.toUpperCase() }}
            </th>
          </tr>
        </thead>
        <tbody>
          <!-- Dynamically listing every Permission as rows -->
          <tr v-for="permission in permissions" :key="permission">
            <td class="font-medium">{{ permission }}</td>
            <td v-for="role in roles" :key="role.id" class="text-center">
              <input 
                type="checkbox" 
                :checked="hasPermission(role, permission)"
                @change="togglePermission(role, permission)"
                :disabled="updatingRoleId === role.id"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios'; // Using your Axios interceptor instances from previous step

const roles = ref([]);
const permissions = ref([]);
const loading = ref(true);
const error = ref(null);
const updatingRoleId = ref(null);

// Fetch data on initialization
const fetchMatrix = async () => {
  try {
    loading.value = true;
    const response = await api.get('/admin/roles-permissions');
    roles.value = response.data.roles;
    permissions.value = response.data.permissions;
  } catch (err) {
    error.value = 'Failed to load permissions configuration from backend.';
  } finally {
    loading.value = false;
  }
};

// Check if a role currently contains a given permission string
const hasPermission = (role, permissionName) => {
  return role.permissions.some(p => p.name === permissionName);
};

// Toggle handler targeting role configuration states
const togglePermission = async (role, permissionName) => {
  updatingRoleId.value = role.id;
  
  // Local reactive optimistic update clone
  let currentPermissions = role.permissions.map(p => p.name);
  
  if (currentPermissions.includes(permissionName)) {
    currentPermissions = currentPermissions.filter(p => p !== permissionName);
  } else {
    currentPermissions.push(permissionName);
  }

  try {
    // Send structural payload sync directly to Laravel API 
    const response = await api.put(`/admin/roles/${role.id}/permissions`, {
      permissions: currentPermissions
    });
    
    // Merge updated backend data block cleanly into local state array
    const targetIdx = roles.value.findIndex(r => r.id === role.id);
    roles.value[targetIdx] = response.data.role;
  } catch (err) {
    alert('Critical error encountered trying to sync server-side roles.');
    await fetchMatrix(); // Rollback local view to match database reality
  } finally {
    updatingRoleId.value = null;
  }
};

onMounted(() => {
  fetchMatrix();
});
</script>

<style scoped>
.role-manager-container { padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: system-ui, sans-serif; }
.subtitle { color: #666; margin-bottom: 2rem; }
.loading-state { padding: 2rem; text-align: center; color: #888; }
.error-banner { background: #fee2e2; color: #b91c1c; padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; }
.table-wrapper { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.matrix-table { width: 100%; border-collapse: collapse; text-align: left; }
.matrix-table th, .matrix-table td { padding: 1rem; border-bottom: 1px solid #e5e7eb; }
.matrix-table th { background: #f9fafb; font-weight: 600; text-transform: capitalize; color: #374151; }
.text-center { text-align: center; }
.font-medium { font-weight: 500; color: #111827; }
input[type="checkbox"] { width: 1.2rem; height: 1.2rem; cursor: pointer; accent-color: #2563eb; }
input[type="checkbox"]:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
