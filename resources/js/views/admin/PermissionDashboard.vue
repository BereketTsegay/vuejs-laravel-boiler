<!-- src/views/admin/PermissionDashboard.vue -->
<template>
  <div class="dashboard-wrapper">
    <div class="header-section">
      <h1>Access Control Center</h1>
      <div class="tabs">
        <button :class="{ active: currentTab === 'matrix' }" @click="currentTab = 'matrix'">Matrix Manager</button>
        <button :class="{ active: currentTab === 'users' }" @click="currentTab = 'users'">User Roles Assignment</button>
      </div>
    </div>

    <!-- Active Tab Panel Contexts -->
    <div v-if="currentTab === 'matrix'">
      <!-- Dynamic Creation Component Embedded -->
      <SchemaCreator @schemaCreated="fetchMatrixData" />
      
      <!-- Table View from Previous Step -->
      <div class="table-wrapper">
        <table class="matrix-table">
          <thead>
            <tr>
              <th>Permissions</th>
              <th v-for="role in roles" :key="role.id" class="text-center">{{ role.name.toUpperCase() }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="permission in permissions" :key="permission">
              <td class="font-medium">{{ permission }}</td>
              <td v-for="role in roles" :key="role.id" class="text-center">
                <input 
                  type="checkbox" 
                  :checked="hasPermission(role, permission)"
                  @change="togglePermission(role, permission)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="currentTab === 'users'">
      <!-- User Assignment Component Embedded passing fetched available role lists -->
      <UserRoleAssigner :availableRoles="roles" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';
import SchemaCreator from '../../componets/SchemaCreator.vue';
import UserRoleAssigner from '../../componets/UserRoleAssigner.vue';

const currentTab = ref('matrix');
const roles = ref([]);
const permissions = ref([]);

const fetchMatrixData = async () => {
  try {
    const response = await api.get('/admin/roles-permissions');
    roles.value = response.data.roles;
    permissions.value = response.data.permissions;
  } catch (err) {
    console.error('Failed fetching security matrix datasets.', err);
  }
};

const hasPermission = (role, permissionName) => {
  return role.permissions.some(p => p.name === permissionName);
};

const togglePermission = async (role, permissionName) => {
  let currentPermissions = role.permissions.map(p => p.name);
  if (currentPermissions.includes(permissionName)) {
    currentPermissions = currentPermissions.filter(p => p !== permissionName);
  } else {
    currentPermissions.push(permissionName);
  }
  try {
    const response = await api.put(`/admin/roles/${role.id}/permissions`, { permissions: currentPermissions });
    const idx = roles.value.findIndex(r => r.id === role.id);
    roles.value[idx] = response.data.role;
  } catch (err) {
    alert('Synchronization connection issue.');
  }
};

onMounted(() => fetchMatrixData());
</script>

<style scoped>
.dashboard-wrapper {
  --access-ink: #202b27;
  --access-muted: #68736d;
  --access-line: #e1e7e2;
  --access-green: #176b4b;
  --access-wash: #f3f7f3;
  max-width: 1280px;
  margin: 0 auto;
  padding: clamp(1.25rem, 4vw, 3.5rem);
  color: var(--access-ink);
  font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
}
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--access-line);
}
.header-section h1 {
  margin: 0;
  font-size: clamp(1.7rem, 3vw, 2.35rem);
  line-height: 1.1;
  font-weight: 650;
  letter-spacing: 0;
}
.tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.3rem;
  border: 1px solid var(--access-line);
  border-radius: 8px;
  background: #edf1ed;
}
.tabs button {
  min-height: 2.5rem;
  padding: 0.55rem 0.9rem;
  border: 1px solid transparent;
  border-radius: 5px;
  background: transparent;
  color: var(--access-muted);
  cursor: pointer;
  font: inherit;
  font-size: 0.875rem;
  font-weight: 600;
  transition: background-color 150ms ease, color 150ms ease, box-shadow 150ms ease;
}
.tabs button:hover { color: var(--access-ink); }
.tabs button.active {
  border-color: var(--access-line);
  background: #fff;
  color: var(--access-green);
  box-shadow: 0 1px 2px rgb(32 43 39 / 8%);
}
.tabs button:focus-visible, input[type="checkbox"]:focus-visible {
  outline: 3px solid rgb(23 107 75 / 24%);
  outline-offset: 2px;
}
.table-wrapper {
  overflow: auto;
  border: 1px solid var(--access-line);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgb(32 43 39 / 4%);
}
.matrix-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
.matrix-table th, .matrix-table td { padding: 0.95rem 1.1rem; border-bottom: 1px solid var(--access-line); }
.matrix-table th {
  position: sticky;
  top: 0;
  background: var(--access-wash);
  color: var(--access-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.matrix-table tbody tr:last-child td { border-bottom: 0; }
.matrix-table tbody tr:hover { background: #f8faf8; }
.text-center { text-align: center; }
.font-medium { font-weight: 600; }
input[type="checkbox"] { width: 1.1rem; height: 1.1rem; cursor: pointer; accent-color: var(--access-green); vertical-align: middle; }
@media (max-width: 700px) {
  .header-section { align-items: stretch; flex-direction: column; }
  .tabs { align-self: flex-start; max-width: 100%; }
  .tabs button { padding-inline: 0.65rem; font-size: 0.8rem; }
  .matrix-table th, .matrix-table td { padding: 0.8rem; }
}
</style>
