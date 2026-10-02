<template>
  <section class="assignment-panel">
    <div class="search-tools"><label class="search-field"><span aria-hidden="true" class="search-icon">⌕</span><input v-model="searchQuery" type="search" placeholder="Search by name or email" aria-label="Search users by name or email" @input="debounceSearch" /></label><span class="search-hint">Search at least 2 characters</span></div>
    <div v-if="searching" class="search-state"><span class="loader"></span>Searching directory…</div>
    <div v-else-if="searchError" class="search-state search-error" role="alert">{{ searchError }}</div>
    <div v-else-if="users.length" class="user-list">
      <article v-for="user in users" :key="user.id" class="user-row">
        <div class="user-identity"><span class="avatar">{{ user.name?.charAt(0)?.toUpperCase() || '?' }}</span><div class="user-info"><strong>{{ user.name }}</strong><span>{{ user.email }}</span></div></div>
        <div class="user-access"><span class="roles-label">ASSIGNED ROLES</span><div v-if="availableRoles.length" class="role-options"><label v-for="role in availableRoles" :key="role.id" class="role-option" :class="{ selected: user.roles.includes(role.name) }"><input type="checkbox" :checked="user.roles.includes(role.name)" :disabled="savingUserId === user.id" :aria-label="`${role.name} role for ${user.name}`" @change="toggleUserRole(user, role.name)" /><span>{{ role.name }}</span></label><span v-if="savingUserId === user.id" class="saving-label">Saving</span></div><span v-else class="no-roles">Create a role to assign access.</span></div>
      </article>
    </div>
    <div v-else-if="searchQuery.trim().length >= 2" class="search-state empty-results"><span class="empty-mark">?</span><strong>No matching users</strong><span>Try another name or email address.</span></div>
    <div v-else class="search-state search-prompt"><span class="search-illustration">⌕</span><strong>Find someone in your workspace</strong><span>Search results will appear here. Role changes are saved as you make them.</span></div>
    <p v-if="notice" class="assignment-notice" role="status">{{ notice }}</p>
  </section>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue';
import api from '../api/axios';

defineProps({ availableRoles: { type: Array, required: true } });

const searchQuery = ref('');
const users = ref([]);
const searching = ref(false);
const searchError = ref('');
const notice = ref('');
const savingUserId = ref(null);
let timeoutId = null;
let searchSequence = 0;

const debounceSearch = () => {
  clearTimeout(timeoutId);
  const query = searchQuery.value.trim();
  const sequence = ++searchSequence;
  searchError.value = '';
  notice.value = '';
  if (query.length < 2) {
    users.value = [];
    searching.value = false;
    return;
  }
  searching.value = true;
  timeoutId = setTimeout(async () => {
    try {
      const response = await api.get('/admin/users/search', { params: { q: query } });
      if (sequence === searchSequence) users.value = response.data;
    } catch (err) {
      if (sequence === searchSequence) searchError.value = 'Could not search users. Please try again.';
    } finally {
      if (sequence === searchSequence) searching.value = false;
    }
  }, 300);
};

const toggleUserRole = async (user, roleName) => {
  const originalRoles = [...user.roles];
  const updatedRoles = originalRoles.includes(roleName)
    ? originalRoles.filter((role) => role !== roleName)
    : [...originalRoles, roleName];
  savingUserId.value = user.id;
  notice.value = '';
  user.roles = updatedRoles;
  try {
    await api.put(`/admin/users/${user.id}/roles`, { roles: updatedRoles });
    notice.value = `Access updated for ${user.name}.`;
  } catch (err) {
    user.roles = originalRoles;
    searchError.value = `Could not update roles for ${user.name}. Please try again.`;
  } finally {
    savingUserId.value = null;
  }
};

onBeforeUnmount(() => clearTimeout(timeoutId));
</script>

<style scoped>
.assignment-panel { color: #35473f; }.search-tools { display: flex; align-items: center; gap: .8rem; margin: 0 0 .9rem; }.search-field { display: flex; width: min(100%, 560px); min-height: 2.8rem; align-items: center; gap: .6rem; padding: 0 .8rem; border: 1px solid #d4ddd6; border-radius: 6px; background: white; transition: border-color .15s ease, box-shadow .15s ease; }.search-field:focus-within { border-color: #176b4b; box-shadow: 0 0 0 3px #176b4b18; }.search-icon { color: #718078; font-size: 1.35rem; line-height: 1; }.search-field input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: #263c32; font: inherit; font-size: .82rem; }.search-field input::placeholder { color: #9aa49c; }.search-hint { color: #879189; font-size: .69rem; white-space: nowrap; }
.user-list { overflow: hidden; border: 1px solid #dfe6de; border-radius: 8px; background: white; }.user-row { display: grid; grid-template-columns: minmax(200px,.75fr) minmax(260px,1.25fr); align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #edf0ec; transition: background .15s ease; }.user-row:hover { background: #fbfcf9; }.user-row:last-child { border-bottom: 0; }.user-identity { display: flex; align-items: center; gap: .75rem; min-width: 0; }.avatar { display: grid; width: 2.5rem; height: 2.5rem; flex: 0 0 auto; place-items: center; border-radius: 50%; background: #e6efda; color: #315d42; font-size: .85rem; font-weight: 750; }.user-info { display: flex; min-width: 0; flex-direction: column; gap: .2rem; }.user-info strong { overflow: hidden; color: #263c32; font-size: .83rem; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }.user-info span { overflow: hidden; color: #78837c; font-size: .73rem; text-overflow: ellipsis; white-space: nowrap; }
.user-access { min-width: 0; }.roles-label { display: block; margin-bottom: .4rem; color: #909990; font-size: .59rem; font-weight: 750; letter-spacing: .1em; }.role-options { display: flex; flex-wrap: wrap; align-items: center; gap: .38rem; }.role-option { display: inline-flex; min-height: 1.9rem; align-items: center; gap: .35rem; padding: .3rem .55rem; border: 1px solid #dbe3dc; border-radius: 5px; background: #f8faf7; color: #637168; cursor: pointer; font-size: .7rem; font-weight: 600; transition: border-color .15s ease, background .15s ease, color .15s ease; }.role-option.selected { border-color: #b8d3bb; background: #edf5ea; color: #17623f; }.role-option:focus-within { outline: 3px solid #d4e86b; outline-offset: 2px; }.role-option input { width: .85rem; height: .85rem; margin: 0; accent-color: #176b4b; cursor: pointer; }.role-option input:disabled { cursor: wait; }.saving-label { color: #738078; font-size: .68rem; }.no-roles { color: #879189; font-size: .74rem; }
.search-state { display: flex; min-height: 160px; flex-direction: column; align-items: center; justify-content: center; gap: .5rem; border: 1px dashed #cbd6cb; border-radius: 8px; background: #fbfcf9; color: #879189; font-size: .76rem; text-align: center; }.search-state strong { color: #35473f; font-size: .87rem; }.search-prompt { padding: 1rem; }.search-illustration { display: grid; width: 2.25rem; height: 2.25rem; margin-bottom: .2rem; place-items: center; border-radius: 50%; background: #edf3e5; color: #53774c; font-size: 1.5rem; }.empty-mark { display: grid; width: 1.8rem; height: 1.8rem; place-items: center; border-radius: 50%; background: #f0f2ed; color: #7d8a80; font-weight: 700; }.search-error { min-height: 60px; border-color: #edc4ba; background: #fff5f1; color: #974a37; }.loader { width: 1.1rem; height: 1.1rem; border: 2px solid #dce7d9; border-top-color: #176b4b; border-radius: 50%; animation: spin .8s linear infinite; }.assignment-notice { margin: .65rem 0 0; color: #24734f; font-size: .75rem; }
@keyframes spin { to { transform: rotate(360deg); } } @media (max-width: 720px) { .search-tools { align-items: flex-start; flex-direction: column; }.user-row { grid-template-columns: 1fr; gap: .8rem; }.search-hint { padding-left: .1rem; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
</style>
