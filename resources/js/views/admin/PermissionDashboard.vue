<!-- src/views/admin/PermissionDashboard.vue -->
<template>
  <div class="dashboard-wrapper">
    <div class="header-section">
      <h1>Enterprise Core Workspace</h1>
      <div class="tabs">
        <button :class="{ active: currentTab === 'matrix' }" @click="currentTab = 'matrix'">Security Matrix</button>
        <button :class="{ active: currentTab === 'users' }" @click="currentTab = 'users'">User Management</button>
        <button :class="{ active: currentTab === 'logs' }" @click="currentTab = 'logs'">Activity Logs</button>
      </div>
    </div>

    <!-- SIDE PANEL COMPONENT: FREQUENTLY VISITED PAGES (Rendered globally across panels) -->
    <div class="frequent-pages-banner">
      <strong>⚡ Quick Links (Most Visited Pages):</strong>
      <span v-for="page in trackerStore.frequentlyVisited" :key="page.name" class="visit-badge">
        {{ page.name }} ({{ page.count }})
      </span>
    </div>

    <!-- TAB 1: SECURITY MATRIX -->
    <div v-if="currentTab === 'matrix'">
      <SchemaCreator @schemaCreated="fetchMatrixData" />
      <UserRoleAssigner :availableRoles="roles" />
    </div>

    <!-- TAB 2: USER MANAGEMENT CRUD -->
    <div v-if="currentTab === 'users'" class="panel-card">
      <h3>System User Accounts</h3>
      <form @submit.prevent="createUser" class="inline-user-form">
        <input v-model="userForm.name" type="text" placeholder="Full Name" required />
        <input v-model="userForm.email" type="email" placeholder="Email Address" required />
        <input v-model="userForm.password" type="password" placeholder="Password (min 8)" required />
        <button type="submit" class="btn-primary">Add User</button>
      </form>

      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Active Roles</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in usersList" :key="u.id">
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>
              <span v-for="r in u.roles" :key="r.name" class="role-pill">{{ r.name }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- TAB 3: SPATIE SYSTEM ACTIVITY LOGS -->
    <div v-if="currentTab === 'logs'" class="panel-card">
      <h3>System Operations & Audit Trail</h3>
      <button @click="fetchLogs" class="btn-secondary">🔄 Refresh Logs</button>

      <div class="logs-timeline">
        <div v-for="log in activityLogs" :key="log.id" class="log-item">
          <span class="log-time">[{{ formatTime(log.created_at) }}]</span>
          <strong class="log-actor">{{ log.causer }}</strong>:
          <span class="log-desc">{{ log.description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../../api/axios';
import { usePageTrackerStore } from '../../stores/pageTracker';
import SchemaCreator from '../../componets/SchemaCreator.vue';
import UserRoleAssigner from '../../componets/UserRoleAssigner.vue';

const currentTab = ref('matrix');
const trackerStore = usePageTrackerStore();

// System States
const roles = ref([]);
const usersList = ref([]);
const activityLogs = ref([]);

const userForm = reactive({ name: '', email: '', password: '' });

const fetchMatrixData = async () => {
  const response = await api.get('/admin/roles-permissions');
  roles.value = response.data.roles;
};

const fetchUsers = async () => {
  const response = await api.get('/admin/users');
  usersList.value = response.data.data;
};

const createUser = async () => {
  try {
    await api.post('/admin/users', userForm);
    alert('User provisioned successfully.');
    fetchUsers();
    userForm.name = ''; userForm.email = ''; userForm.password = '';
  } catch (err) {
    alert(err.response?.data?.message || 'Error parsing user schema rules.');
  }
};

const fetchLogs = async () => {
  const response = await api.get('/admin/activity-logs');
  activityLogs.value = response.data;
};

const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

onMounted(() => {
  fetchMatrixData();
  fetchUsers();
  fetchLogs();
});
</script>

<style scoped>
.dashboard-wrapper { padding: 2rem; max-width: 1200px; margin: 0 auto; font-family: system-ui, sans-serif; }
.header-section { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1.5rem; }
.tabs button { padding: 0.6rem 1.2rem; background: #e5e7eb; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; margin-right: 0.5rem; }
.tabs button.active { background: #2563eb; color: white; }
.frequent-pages-banner { background: #eff6ff; border: 1px solid #bfdbfe; padding: 0.75rem 1rem; border-radius: 8px; margin-bottom: 2rem; font-size: 0.9rem; }
.visit-badge { background: #2563eb; color: white; padding: 0.2rem 0.6rem; border-radius: 12px; margin-left: 0.5rem; font-size: 0.8rem; }
.panel-card { background: white; padding: 1.5rem; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 2rem; }
.inline-user-form { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
.inline-user-form input { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; flex: 1; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th, .data-table td { padding: 0.75rem; border-bottom: 1px solid #e5e7eb; }
.role-pill { background: #f3f4f6; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; border: 1px solid #e5e7eb; }
.logs-timeline { background: #1e293b; color: #f8fafc; padding: 1.5rem; border-radius: 6px; font-family: monospace; max-height: 400px; overflow-y: auto; margin-top: 1rem; }
.log-item { margin-bottom: 0.5rem; border-bottom: 1px solid #334155; padding-bottom: 0.25rem; font-size: 0.9rem; }
.log-time { color: #38bdf8; margin-right: 0.5rem; }
.log-actor { color: #4ade80; }
.btn-primary { background: #2563eb; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; }
.btn-secondary { background: #4b5563; color: white; border: none; padding: 0.4rem 1rem; border-radius: 6px; cursor: pointer; }
</style>
