<template>
  <div class="role-page">
    <header class="role-header">
      <div><p class="eyebrow">ADMINISTRATION / ACCESS MODEL</p><h2>Role management</h2><p>Manage permission scopes across every role in your workspace.</p></div>
      <div class="role-total"><span>DEFINED ROLES</span><strong>{{ roles.length.toString().padStart(2, '0') }}</strong></div>
    </header>

    <section class="role-stats" aria-label="Role management summary">
      <div><span class="stat-icon">R</span><span><small>ROLES</small><strong>{{ roles.length }}</strong></span></div>
      <div><span class="stat-icon stat-permission">P</span><span><small>PERMISSIONS</small><strong>{{ permissions.length }}</strong></span></div>
      <div><span class="stat-icon stat-live">✓</span><span><small>CONFIGURATION</small><strong>{{ loading ? 'Refreshing' : 'Up to date' }}</strong></span></div>
    </section>

    <section class="matrix-section">
      <div class="matrix-heading"><div><p class="eyebrow">ROLE CAPABILITIES</p><h3>Permission matrix</h3><p>Select a permission to grant or revoke it for a role.</p></div><span class="matrix-count">{{ permissions.length }} permissions <i></i> {{ roles.length }} roles</span></div>
      <div v-if="error" class="error-banner" role="alert">{{ error }}</div>
      <div v-if="loading" class="loading-state"><span class="loader"></span>Loading role configuration</div>
      <div v-else-if="!permissions.length || !roles.length" class="empty-state"><strong>Nothing to manage yet</strong><span>Add roles and permissions in Role and Permissions to build this matrix.</span></div>
      <div v-else class="table-wrapper">
        <table class="matrix-table">
          <thead><tr><th class="permission-heading">CAPABILITY <span>{{ permissions.length }}</span></th><th v-for="role in roles" :key="role.id">{{ role.name }}</th></tr></thead>
          <tbody>
            <tr v-for="permission in permissions" :key="permission">
              <td class="permission-name"><span class="capability-mark">↳</span>{{ permission }}</td>
              <td v-for="role in roles" :key="role.id" class="permission-control"><label class="switch"><input type="checkbox" :checked="hasPermission(role, permission)" :disabled="updatingRoleId === role.id" :aria-label="`${permission} for ${role.name}`" @change="togglePermission(role, permission)" /><span></span></label></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="notice" class="save-notice" role="status">{{ notice }}</p>
      <p class="matrix-footnote"><span class="footnote-dot"></span>Updates are saved immediately and apply when users refresh their access token.</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../../api/axios';

const roles = ref([]);
const permissions = ref([]);
const loading = ref(true);
const error = ref('');
const notice = ref('');
const updatingRoleId = ref(null);

const fetchMatrix = async () => {
  error.value = '';
  loading.value = true;
  try {
    const response = await api.get('/admin/roles-permissions');
    roles.value = response.data.roles;
    permissions.value = response.data.permissions;
  } catch (err) {
    error.value = 'Failed to load the role configuration. Please try again.';
  } finally {
    loading.value = false;
  }
};

const hasPermission = (role, permissionName) => role.permissions.some((permission) => permission.name === permissionName);

const togglePermission = async (role, permissionName) => {
  error.value = '';
  notice.value = '';
  updatingRoleId.value = role.id;
  const currentPermissions = role.permissions.map((permission) => permission.name);
  const nextPermissions = currentPermissions.includes(permissionName)
    ? currentPermissions.filter((permission) => permission !== permissionName)
    : [...currentPermissions, permissionName];
  try {
    const response = await api.put(`/admin/roles/${role.id}/permissions`, { permissions: nextPermissions });
    const index = roles.value.findIndex((item) => item.id === role.id);
    if (index !== -1) roles.value[index] = response.data.role;
    notice.value = `Saved changes to ${role.name}.`;
  } catch (err) {
    error.value = `Could not update ${role.name}. The matrix has been refreshed from the server.`;
    await fetchMatrix();
  } finally {
    updatingRoleId.value = null;
  }
};

onMounted(fetchMatrix);
</script>

<style scoped>
.role-page { --ink: #173d32; --body: #384941; --muted: #78847c; --line: #dfe6de; color: var(--body); }
.role-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 1.5rem; padding: .35rem 0 1.55rem; border-bottom: 1px solid var(--line); }
.eyebrow { margin: 0 0 .6rem; color: #78857c; font-size: .66rem; font-weight: 750; letter-spacing: .12em; }
.role-header h2 { margin: 0; color: var(--ink); font-size: 1.9rem; font-weight: 650; line-height: 1.15; }.role-header p:not(.eyebrow) { margin: .55rem 0 0; color: var(--muted); font-size: .88rem; }
.role-total { display: flex; flex-direction: column; align-items: flex-end; gap: .15rem; padding-left: 1rem; border-left: 2px solid #d4e86b; }.role-total span { color: var(--muted); font-size: .61rem; font-weight: 750; letter-spacing: .1em; }.role-total strong { color: var(--ink); font-size: 1.35rem; font-weight: 650; font-variant-numeric: tabular-nums; }
.role-stats { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: .8rem; margin: 1.25rem 0 1.65rem; }.role-stats > div { display: flex; align-items: center; gap: .8rem; min-height: 82px; padding: .95rem 1rem; border: 1px solid var(--line); border-radius: 8px; background: #fff; }.role-stats > div:first-child { border-color: var(--ink); background: var(--ink); }.stat-icon { display: grid; width: 2.2rem; height: 2.2rem; place-items: center; border-radius: 6px; background: #d4e86b; color: var(--ink); font-size: .8rem; font-weight: 800; }.stat-permission { background: #eef2e6; color: #567248; }.stat-live { background: #e7f2eb; color: #24734f; }.role-stats small { display: block; color: var(--muted); font-size: .62rem; font-weight: 750; letter-spacing: .1em; }.role-stats strong { display: block; margin-top: .18rem; color: var(--ink); font-size: .95rem; font-weight: 650; }.role-stats > div:first-child small { color: #bfccb9; }.role-stats > div:first-child strong { color: white; }
.matrix-section { padding: 1.2rem 0 0; }.matrix-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }.matrix-heading .eyebrow { margin-bottom: .35rem; }.matrix-heading h3 { margin: 0; color: var(--ink); font-size: 1.12rem; font-weight: 650; }.matrix-heading p:not(.eyebrow) { margin: .35rem 0 0; color: var(--muted); font-size: .79rem; }.matrix-count { display: flex; align-items: center; gap: .5rem; padding: .4rem .65rem; border: 1px solid var(--line); border-radius: 5px; background: white; color: #607168; font-size: .7rem; font-weight: 650; white-space: nowrap; }.matrix-count i { width: 3px; height: 3px; border-radius: 50%; background: #a8b0a9; }
.table-wrapper { overflow: auto; max-height: 570px; border: 1px solid var(--line); border-radius: 8px; background: white; }.matrix-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }.matrix-table th, .matrix-table td { padding: .82rem 1rem; border-bottom: 1px solid #edf0ec; }.matrix-table th { position: sticky; z-index: 1; top: 0; min-width: 130px; background: #f5f7f2; color: #738078; font-size: .65rem; font-weight: 750; letter-spacing: .06em; text-transform: capitalize; }.matrix-table th.permission-heading { min-width: 250px; text-transform: uppercase; }.permission-heading span { margin-left: .35rem; color: #a4ada5; }.matrix-table tbody tr:last-child td { border-bottom: 0; }.matrix-table tbody tr:hover { background: #fafbf8; }.permission-name { color: #34463e; font-size: .82rem; font-weight: 600; white-space: nowrap; }.capability-mark { display: inline-grid; width: 1.3rem; height: 1.3rem; margin-right: .65rem; place-items: center; border-radius: 4px; background: #edf4e4; color: #63813c; font-size: .8rem; }.permission-control { text-align: center; }.switch { display: inline-flex; cursor: pointer; }.switch input { position: absolute; width: 1px; height: 1px; opacity: 0; }.switch span { position: relative; display: block; width: 2rem; height: 1.15rem; border-radius: 99px; background: #d9dfd9; transition: background .16s ease; }.switch span::after { position: absolute; top: .15rem; left: .15rem; width: .85rem; height: .85rem; border-radius: 50%; background: white; box-shadow: 0 1px 2px #20352d30; content: ''; transition: transform .16s ease; }.switch input:checked + span { background: #176b4b; }.switch input:checked + span::after { transform: translateX(.85rem); }.switch input:focus-visible + span { outline: 3px solid #d4e86b; outline-offset: 3px; }.switch input:disabled + span { cursor: wait; opacity: .5; }
.loading-state, .empty-state { display: flex; min-height: 170px; align-items: center; justify-content: center; gap: .65rem; border: 1px dashed #cbd6cb; border-radius: 8px; background: #fbfcf9; color: var(--muted); font-size: .82rem; }.empty-state { flex-direction: column; }.empty-state strong { color: var(--ink); font-size: .95rem; }.loader { width: 1.2rem; height: 1.2rem; border: 2px solid #dce7d9; border-top-color: #176b4b; border-radius: 50%; animation: spin .8s linear infinite; }
.error-banner { margin: 0 0 .85rem; padding: .75rem .9rem; border: 1px solid #edc4ba; border-radius: 6px; background: #fff5f1; color: #974a37; font-size: .8rem; }.save-notice { margin: .75rem 0 0; color: #24734f; font-size: .78rem; }.matrix-footnote { display: flex; align-items: center; gap: .5rem; margin: .85rem 0 0; color: #879189; font-size: .72rem; }.footnote-dot { width: .4rem; height: .4rem; border-radius: 50%; background: #84a24c; }
@keyframes spin { to { transform: rotate(360deg); } } @media (max-width: 700px) { .role-header { align-items: flex-start; flex-direction: column; }.role-total { flex-direction: row; align-items: baseline; gap: .6rem; padding: 0; border: 0; }.role-stats { grid-template-columns: 1fr; gap: .55rem; margin: 1rem 0 1.25rem; }.role-stats > div { min-height: 68px; }.matrix-heading { align-items: flex-start; flex-direction: column; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
</style>
