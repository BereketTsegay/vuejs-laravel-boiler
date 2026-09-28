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
import api from '@/services/api';
import SchemaCreator from '@/components/admin/SchemaCreator.vue';
import UserRoleAssigner from '@/components/admin/UserRoleAssigner.vue';

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
.dashboard-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: system-ui, sans-serif; }
.header-section { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 2rem; }
.tabs { display: flex; gap: 1rem; }
.tabs button { padding: 0.6rem 1.2rem; background: #e5e7eb; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
.tabs button.active { background: #2563eb; color: white; }
.table-wrapper { overflow-x: auto; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; }
.matrix-table { width: 100%; border-collapse: collapse; }
.matrix-table th, .matrix-table td { padding: 1rem; border-bottom: 1px solid #e5e7eb; }
.text-center { text-align: center; }
.font-medium { font-weight: 500; }
input[type="checkbox"] { width: 1.15rem; height: 1.15rem; cursor: pointer; accent-color: #2563eb; }
</style>
