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
.role-manager-container {
  --access-ink: #202b27;
  --access-muted: #68736d;
  --access-line: #e1e7e2;
  --access-green: #176b4b;
  max-width: 1280px;
  margin: 0 auto;
  padding: clamp(1.25rem, 4vw, 3.5rem);
  color: var(--access-ink);
  font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
}
.role-manager-container h2 { margin: 0; font-size: clamp(1.55rem, 3vw, 2.1rem); line-height: 1.15; font-weight: 650; }
.subtitle { margin: 0.7rem 0 1.75rem; color: var(--access-muted); font-size: 0.9rem; }
.loading-state { padding: 2rem; border: 1px solid var(--access-line); border-radius: 8px; background: #f3f7f3; color: var(--access-muted); text-align: center; }
.error-banner { margin-bottom: 1.5rem; padding: 0.9rem 1rem; border: 1px solid #f0c5bd; border-radius: 6px; background: #fff2ef; color: #a83f2c; font-size: 0.875rem; }
.table-wrapper { overflow: auto; border: 1px solid var(--access-line); border-radius: 8px; background: #fff; box-shadow: 0 8px 24px rgb(32 43 39 / 4%); }
.matrix-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
.matrix-table th, .matrix-table td { padding: 0.95rem 1.1rem; border-bottom: 1px solid var(--access-line); }
.matrix-table th { position: sticky; top: 0; background: #f3f7f3; color: var(--access-muted); font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; }
.matrix-table tbody tr:last-child td { border-bottom: 0; }
.matrix-table tbody tr:hover { background: #f8faf8; }
.text-center { text-align: center; }
.font-medium { color: var(--access-ink); font-weight: 600; }
input[type="checkbox"] { width: 1.1rem; height: 1.1rem; cursor: pointer; accent-color: var(--access-green); vertical-align: middle; }
input[type="checkbox"]:focus-visible { outline: 3px solid rgb(23 107 75 / 24%); outline-offset: 2px; }
input[type="checkbox"]:disabled { opacity: 0.5; cursor: wait; }
@media (max-width: 700px) { .matrix-table th, .matrix-table td { padding: 0.8rem; } }
</style>
